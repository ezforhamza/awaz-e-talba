import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCurrentAdmin } from "@/hooks/useCurrentAdmin";

interface Candidate {
	id: string;
	name: string;
	description: string | null;
	profile_image_url: string | null;
	election_symbol_url: string | null;
	position: number;
	election_id: string;
	admin_id: string;
	created_at: string;
	updated_at: string;
}

interface CandidateWithVoteCount extends Candidate {
	vote_count?: number;
	vote_percentage?: number;
}

export const useCandidateQueries = (electionId?: string) => {
	const { adminId, isLoading: isAdminLoading } = useCurrentAdmin();

	// Fetch candidates for specific election
	const candidatesQuery = useQuery({
		queryKey: ["candidates", electionId],
		enabled: !!electionId,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("candidates")
				.select("*")
				.eq("election_id", electionId)
				.order("position", { ascending: true });

			if (error) throw new Error(error.message);
			return data as Candidate[];
		},
	});

	// Fetch all candidates for admin
	const allCandidatesQuery = useQuery({
		queryKey: ["candidates", "all", adminId],
		enabled: !!adminId && !isAdminLoading,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("candidates")
				.select(`
          *,
          elections!inner(admin_id)
        `)
				.eq("elections.admin_id", adminId)
				.order("created_at", { ascending: false });

			if (error) throw new Error(error.message);
			return data as Candidate[];
		},
	});

	// Get candidates with vote counts (for results)
	const getCandidatesWithVotes = async (electionId: string): Promise<CandidateWithVoteCount[]> => {
		const { data: candidates, error } = await supabase
			.from("candidates")
			.select("*")
			.eq("election_id", electionId)
			.order("position");

		if (error) throw new Error(error.message);

		const candidatesWithVotes = await Promise.all(
			candidates.map(async (candidate) => {
				const { data: votes } = await supabase.from("votes").select("id").eq("candidate_id", candidate.id);

				const voteCount = votes?.length || 0;

				// Get total votes for election to calculate percentage
				const { data: totalVotes } = await supabase.from("votes").select("id").eq("election_id", electionId);

				const totalCount = totalVotes?.length || 0;
				const votePercentage = totalCount > 0 ? Math.round((voteCount / totalCount) * 100 * 100) / 100 : 0;

				return {
					...candidate,
					vote_count: voteCount,
					vote_percentage: votePercentage,
				};
			}),
		);

		return candidatesWithVotes.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
	};

	// Helper functions
	const getCandidateById = (id: string) =>
		candidatesQuery.data?.find((c) => c.id === id) || allCandidatesQuery.data?.find((c) => c.id === id);

	const getCandidatesByPosition = () => candidatesQuery.data?.sort((a, b) => a.position - b.position) || [];

	const getNextPosition = () => {
		if (!candidatesQuery.data || candidatesQuery.data.length === 0) return 1;
		return Math.max(...candidatesQuery.data.map((c) => c.position)) + 1;
	};

	return {
		// Query data
		candidates: candidatesQuery.data || [],
		allCandidates: allCandidatesQuery.data || [],

		// Query states
		isLoading: candidatesQuery.isLoading,
		error: candidatesQuery.error?.message,

		// Helper functions
		getCandidateById,
		getCandidatesByPosition,
		getCandidatesWithVotes,
		getNextPosition,
	};
};

export type { Candidate, CandidateWithVoteCount };
