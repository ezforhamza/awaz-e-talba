import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCurrentAdmin } from "@/hooks/useCurrentAdmin";

interface Election {
	id: string;
	title: string;
	description: string | null;
	category: string;
	start_date: string;
	end_date: string;
	status: "draft" | "active" | "completed" | "archived";
	voting_instructions: string | null;
	admin_id: string;
	created_at: string;
	updated_at: string;
	candidates?: Array<{
		id: string;
		name: string;
		description: string | null;
		profile_image_url: string | null;
		election_symbol_url: string | null;
		position: number;
	}>;
}

export const useElectionActions = (elections?: Election[]) => {
	const queryClient = useQueryClient();
	const { adminId } = useCurrentAdmin();

	// Change election status (draft → active → completed → archived)
	const changeElectionStatusMutation = useMutation({
		mutationFn: async ({ id, status }: { id: string; status: Election["status"] }) => {
			if (!adminId) {
				throw new Error("User not authenticated");
			}

			// Validate status transitions
			const election = elections?.find((e) => e.id === id);
			if (!election) {
				throw new Error("Election not found");
			}

			// Business rules for status changes
			if (status === "active") {
				// Check if election has candidates
				const candidateCount = election.candidates?.length || 0;
				if (candidateCount < 2) {
					throw new Error("Election must have at least 2 candidates before activation");
				}

				// Check if start date is valid
				if (new Date(election.start_date) > new Date()) {
					throw new Error("Cannot activate election before its start date");
				}
			}

			const { data, error } = await supabase
				.from("elections")
				.update({
					status,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.eq("admin_id", adminId)
				.select()
				.single();

			if (error) throw new Error(error.message);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["elections"] });
			queryClient.invalidateQueries({ queryKey: ["elections", "active"] });
		},
	});

	return {
		// Mutations
		changeElectionStatus: changeElectionStatusMutation.mutateAsync,

		// Loading states
		isChangingStatus: changeElectionStatusMutation.isPending,

		// Error states
		statusError: changeElectionStatusMutation.error?.message,
	};
};

export type { Election };
