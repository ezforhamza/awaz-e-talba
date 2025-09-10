import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCurrentAdmin } from "@/hooks/useCurrentAdmin";

interface CreateCandidateData {
	name: string;
	description?: string;
	profile_image_url?: string;
	election_symbol_url?: string;
	position: number;
	election_id: string;
}

interface UpdateCandidateData extends Partial<Omit<CreateCandidateData, "election_id">> {
	id: string;
}

export const useCandidateMutations = () => {
	const queryClient = useQueryClient();
	const { adminId } = useCurrentAdmin();

	// Create candidate mutation
	const createCandidateMutation = useMutation({
		mutationFn: async (candidateData: CreateCandidateData) => {
			if (!adminId) {
				throw new Error("Please wait for authentication to complete");
			}

			// Validate election ownership
			const { data: election, error: electionError } = await supabase
				.from("elections")
				.select("admin_id, status")
				.eq("id", candidateData.election_id)
				.single();

			if (electionError || !election) {
				throw new Error("Election not found");
			}

			if (election.admin_id !== adminId) {
				throw new Error("You can only add candidates to your own elections");
			}

			if (election.status !== "draft") {
				throw new Error("Cannot add candidates to active or completed elections");
			}

			// Check for duplicate candidate name in this election
			const { data: existingCandidates, error: duplicateError } = await supabase
				.from("candidates")
				.select("name")
				.eq("election_id", candidateData.election_id)
				.ilike("name", candidateData.name.trim());

			if (duplicateError) {
				throw new Error("Failed to check for duplicate names");
			}

			if (existingCandidates && existingCandidates.length > 0) {
				throw new Error(
					`A candidate named "${candidateData.name.trim()}" already exists in this election. Please use a different name.`,
				);
			}

			const dataWithAdmin = {
				name: candidateData.name.trim(),
				description: candidateData.description?.trim() || null,
				profile_image_url: candidateData.profile_image_url || null,
				election_symbol_url: candidateData.election_symbol_url || null,
				position: candidateData.position,
				election_id: candidateData.election_id,
				admin_id: adminId,
			};

			const { data, error } = await supabase.from("candidates").insert([dataWithAdmin]).select().single();

			if (error) {
				console.error("Candidate creation error:", error);

				// Handle specific constraint violations
				if (error.code === "23505" && error.message.includes("candidates_election_id_position_key")) {
					throw new Error(`A candidate already exists at position ${candidateData.position} for this election`);
				}

				throw new Error(error.message);
			}
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["candidates"] });
			queryClient.invalidateQueries({ queryKey: ["elections"] });
		},
	});

	// Update candidate mutation
	const updateCandidateMutation = useMutation({
		mutationFn: async ({ id, ...updateData }: UpdateCandidateData) => {
			if (!adminId) {
				throw new Error("User not authenticated");
			}

			// Get current candidate to verify ownership
			const { data: currentCandidate, error: fetchError } = await supabase
				.from("candidates")
				.select(`
          *,
          elections!inner(admin_id, status)
        `)
				.eq("id", id)
				.single();

			if (fetchError || !currentCandidate) {
				throw new Error("Candidate not found");
			}

			if (currentCandidate.elections.admin_id !== adminId) {
				throw new Error("You can only update your own candidates");
			}

			if (currentCandidate.elections.status !== "draft") {
				throw new Error("Cannot update candidates in active or completed elections");
			}

			// Check for duplicate candidate name in this election (excluding current candidate)
			if (updateData.name && updateData.name.trim().toLowerCase() !== currentCandidate.name.toLowerCase()) {
				const { data: existingCandidates, error: duplicateError } = await supabase
					.from("candidates")
					.select("name")
					.eq("election_id", currentCandidate.election_id)
					.neq("id", id)
					.ilike("name", updateData.name.trim());

				if (duplicateError) {
					throw new Error("Failed to check for duplicate names");
				}

				if (existingCandidates && existingCandidates.length > 0) {
					throw new Error(
						`A candidate named "${updateData.name.trim()}" already exists in this election. Please use a different name.`,
					);
				}
			}

			const finalUpdateData = {
				name: updateData.name?.trim(),
				description: updateData.description?.trim() || null,
				profile_image_url: updateData.profile_image_url ?? currentCandidate.profile_image_url,
				election_symbol_url: updateData.election_symbol_url ?? currentCandidate.election_symbol_url,
				position: updateData.position,
				updated_at: new Date().toISOString(),
			};

			// Remove undefined values
			const cleanUpdateData = Object.fromEntries(
				Object.entries(finalUpdateData).filter(([_, value]) => value !== undefined),
			);

			const { data, error } = await supabase.from("candidates").update(cleanUpdateData).eq("id", id).select().single();

			if (error) {
				console.error("Candidate update error:", error);

				if (error.code === "23505" && error.message.includes("candidates_election_id_position_key")) {
					throw new Error(`A candidate already exists at position ${updateData.position} for this election`);
				}

				throw new Error(error.message);
			}
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["candidates"] });
			queryClient.invalidateQueries({ queryKey: ["elections"] });
		},
	});

	return {
		// Mutations
		createCandidate: createCandidateMutation.mutateAsync,
		updateCandidate: updateCandidateMutation.mutateAsync,

		// Loading states
		isCreating: createCandidateMutation.isPending,
		isUpdating: updateCandidateMutation.isPending,

		// Error states
		createError: createCandidateMutation.error?.message,
		updateError: updateCandidateMutation.error?.message,
	};
};

export type { CreateCandidateData, UpdateCandidateData };
