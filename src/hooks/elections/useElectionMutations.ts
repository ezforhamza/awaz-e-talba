import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCurrentAdmin } from "@/hooks/useCurrentAdmin";

interface CreateElectionData {
	title: string;
	description?: string;
	category: string;
	start_date: string;
	end_date: string;
	voting_instructions?: string;
}

interface UpdateElectionData extends Partial<CreateElectionData> {
	id: string;
	status?: "draft" | "active" | "completed" | "archived";
}

export const useElectionMutations = () => {
	const queryClient = useQueryClient();
	const { adminId } = useCurrentAdmin();

	// Create election mutation
	const createElectionMutation = useMutation({
		mutationFn: async (electionData: CreateElectionData) => {
			if (!adminId) {
				throw new Error("Please wait for authentication to complete");
			}

			// Validate dates
			if (new Date(electionData.end_date) <= new Date(electionData.start_date)) {
				throw new Error("End date must be after start date");
			}

			const dataWithAdmin = {
				...electionData,
				admin_id: adminId,
				status: "draft" as const,
				description: electionData.description?.trim() || null,
				voting_instructions: electionData.voting_instructions?.trim() || null,
			};

			const { data, error } = await supabase.from("elections").insert([dataWithAdmin]).select().single();

			if (error) {
				console.error("Election creation error:", error);
				throw new Error(error.message);
			}
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["elections"] });
		},
	});

	// Update election mutation
	const updateElectionMutation = useMutation({
		mutationFn: async ({ id, ...updateData }: UpdateElectionData) => {
			if (!adminId) {
				throw new Error("User not authenticated");
			}

			// Validate dates if being updated
			if (updateData.start_date && updateData.end_date) {
				if (new Date(updateData.end_date) <= new Date(updateData.start_date)) {
					throw new Error("End date must be after start date");
				}
			}

			const { data, error } = await supabase
				.from("elections")
				.update({
					...updateData,
					description: updateData.description?.trim() || null,
					voting_instructions: updateData.voting_instructions?.trim() || null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.eq("admin_id", adminId) // Ensure user can only update their own elections
				.select()
				.single();

			if (error) {
				console.error("Election update error:", error);
				throw new Error(error.message);
			}
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["elections"] });
		},
	});

	// Delete election mutation
	const deleteElectionMutation = useMutation({
		mutationFn: async (id: string) => {
			if (!adminId) {
				throw new Error("User not authenticated");
			}

			// Check if election has any votes
			const { data: votes } = await supabase.from("votes").select("id").eq("election_id", id).limit(1);

			if (votes && votes.length > 0) {
				throw new Error("Cannot delete election that already has votes");
			}

			const { error } = await supabase.from("elections").delete().eq("id", id).eq("admin_id", adminId); // Ensure user can only delete their own elections

			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["elections"] });
		},
	});

	return {
		// Mutations
		createElection: createElectionMutation.mutateAsync,
		updateElection: updateElectionMutation.mutateAsync,
		deleteElection: deleteElectionMutation.mutateAsync,

		// Loading states
		isCreating: createElectionMutation.isPending,
		isUpdating: updateElectionMutation.isPending,
		isDeleting: deleteElectionMutation.isPending,

		// Error states
		createError: createElectionMutation.error?.message,
		updateError: updateElectionMutation.error?.message,
		deleteError: deleteElectionMutation.error?.message,
	};
};

export type { CreateElectionData, UpdateElectionData };
