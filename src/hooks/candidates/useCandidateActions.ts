import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCurrentAdmin } from "@/hooks/useCurrentAdmin";

export const useCandidateActions = () => {
	const queryClient = useQueryClient();
	const { adminId } = useCurrentAdmin();

	// Delete candidate mutation with position adjustment
	const deleteCandidateMutation = useMutation({
		mutationFn: async (id: string) => {
			if (!adminId) {
				throw new Error("User not authenticated");
			}

			// Get candidate details for ownership check and cleanup
			const { data: candidate, error: fetchError } = await supabase
				.from("candidates")
				.select(`
          *,
          elections!inner(admin_id, status)
        `)
				.eq("id", id)
				.single();

			if (fetchError || !candidate) {
				throw new Error("Candidate not found");
			}

			if (candidate.elections.admin_id !== adminId) {
				throw new Error("You can only delete your own candidates");
			}

			if (candidate.elections.status !== "draft") {
				throw new Error("Cannot delete candidates from active or completed elections");
			}

			// Check if candidate has any votes
			const { data: votes } = await supabase.from("votes").select("id").eq("candidate_id", id).limit(1);

			if (votes && votes.length > 0) {
				throw new Error("Cannot delete candidate who has received votes");
			}

			// Store the position of the candidate being deleted
			const deletedPosition = candidate.position;
			const electionId = candidate.election_id;

			// Delete associated images from uploads bucket
			if (candidate.profile_image_url && candidate.profile_image_url.includes("/uploads/")) {
				const imagePath = candidate.profile_image_url.split("/uploads/")[1];
				if (imagePath) {
					await supabase.storage.from("uploads").remove([imagePath]);
				}
			}

			if (candidate.election_symbol_url && candidate.election_symbol_url.includes("/uploads/")) {
				const symbolPath = candidate.election_symbol_url.split("/uploads/")[1];
				if (symbolPath) {
					await supabase.storage.from("uploads").remove([symbolPath]);
				}
			}

			// Delete the candidate
			const { error } = await supabase.from("candidates").delete().eq("id", id);

			if (error) throw new Error(error.message);

			// Get all remaining candidates in this election with positions higher than the deleted one
			const { data: candidatesToUpdate, error: positionFetchError } = await supabase
				.from("candidates")
				.select("id, position")
				.eq("election_id", electionId)
				.gt("position", deletedPosition)
				.order("position");

			if (positionFetchError) {
				console.warn("Failed to fetch candidates for position adjustment:", positionFetchError.message);
				return; // Don't throw here, deletion was successful
			}

			// Update positions for remaining candidates (shift them down by 1)
			if (candidatesToUpdate && candidatesToUpdate.length > 0) {
				const updatePromises = candidatesToUpdate.map((candidateToUpdate) =>
					supabase
						.from("candidates")
						.update({
							position: candidateToUpdate.position - 1,
							updated_at: new Date().toISOString(),
						})
						.eq("id", candidateToUpdate.id),
				);

				const results = await Promise.allSettled(updatePromises);
				const failures = results.filter((r) => r.status === "rejected");

				if (failures.length > 0) {
					console.warn(`Failed to update positions for ${failures.length} candidates after deletion`);
				}
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["candidates"] });
			queryClient.invalidateQueries({ queryKey: ["elections"] });
		},
	});

	// Reorder candidates mutation
	const reorderCandidatesMutation = useMutation({
		mutationFn: async (candidateUpdates: Array<{ id: string; position: number }>) => {
			if (!adminId) {
				throw new Error("User not authenticated");
			}

			// Verify all candidates belong to user's elections
			const candidateIds = candidateUpdates.map((c) => c.id);
			const { data: candidates, error: fetchError } = await supabase
				.from("candidates")
				.select(`
          id,
          elections!inner(admin_id, status)
        `)
				.in("id", candidateIds);

			if (fetchError) {
				throw new Error("Failed to fetch candidates");
			}

			const unauthorizedCandidate = candidates?.find((c) => (c.elections as any).admin_id !== adminId);
			if (unauthorizedCandidate) {
				throw new Error("You can only reorder your own candidates");
			}

			const activeElectionCandidate = candidates?.find((c) => (c.elections as any).status !== "draft");
			if (activeElectionCandidate) {
				throw new Error("Cannot reorder candidates in active or completed elections");
			}

			// Update positions in batch
			const updates = candidateUpdates.map((update) =>
				supabase
					.from("candidates")
					.update({
						position: update.position,
						updated_at: new Date().toISOString(),
					})
					.eq("id", update.id),
			);

			const results = await Promise.allSettled(updates);
			const failures = results.filter((r) => r.status === "rejected");

			if (failures.length > 0) {
				throw new Error("Failed to update some candidate positions");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["candidates"] });
		},
	});

	return {
		// Mutations
		deleteCandidate: deleteCandidateMutation.mutateAsync,
		reorderCandidates: reorderCandidatesMutation.mutateAsync,

		// Loading states
		isDeleting: deleteCandidateMutation.isPending,
		isReordering: reorderCandidatesMutation.isPending,

		// Error states
		deleteError: deleteCandidateMutation.error?.message,
		reorderError: reorderCandidatesMutation.error?.message,
	};
};
