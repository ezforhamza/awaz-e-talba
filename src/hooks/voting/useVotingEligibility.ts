import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { createVoterHash, isValidVotingId } from "@/utils/security";

interface VotingEligibilityCheck {
	isEligible: boolean;
	reason?: string;
	studentName?: string;
	elections: Array<{
		id: string;
		title: string;
		category: string;
		description?: string;
		candidates: Array<{
			id: string;
			name: string;
			description?: string;
			profile_image_url?: string;
			election_symbol_url?: string;
			position: number;
		}>;
		hasVoted: boolean;
	}>;
}

export const useVotingEligibility = () => {
	// Check voting eligibility
	const checkEligibilityMutation = useMutation({
		mutationFn: async (votingId: string): Promise<VotingEligibilityCheck> => {
			// Validate voting ID format
			if (!isValidVotingId(votingId)) {
				return {
					isEligible: false,
					reason: "Invalid voting ID format",
					elections: [],
				};
			}

			// Get student information (anonymously)
			const { data: student, error: studentError } = await supabase
				.from("students")
				.select("name, is_active")
				.eq("voting_id", votingId)
				.eq("is_active", true)
				.single();

			if (studentError || !student) {
				return {
					isEligible: false,
					reason: "Student not found or not active for voting",
					elections: [],
				};
			}

			// Get active elections
			const { data: elections, error: electionsError } = await supabase
				.from("elections")
				.select(`
          id,
          title,
          category,
          description,
          candidates (
            id, 
            name, 
            description,
            profile_image_url,
            election_symbol_url,
            position
          )
        `)
				.eq("status", "active")
				.lte("start_date", new Date().toISOString())
				.gte("end_date", new Date().toISOString());

			if (electionsError) {
				throw new Error(electionsError.message);
			}

			if (!elections || elections.length === 0) {
				return {
					isEligible: false,
					reason: "No active elections available",
					studentName: student.name,
					elections: [],
				};
			}

			// Check which elections the student has already voted in
			const voterHash = await createVoterHash(votingId);
			const { data: existingVotes } = await supabase
				.from("votes")
				.select("election_id")
				.eq("encrypted_voter_hash", voterHash);

			const votedElectionIds = existingVotes?.map((vote) => vote.election_id) || [];

			const electionStatus = elections.map((election) => ({
				id: election.id,
				title: election.title,
				category: election.category,
				description: election.description,
				candidates: election.candidates || [],
				hasVoted: votedElectionIds.includes(election.id),
			}));

			const availableElections = electionStatus.filter((e) => !e.hasVoted);

			return {
				isEligible: availableElections.length > 0,
				reason: availableElections.length === 0 ? "Already voted in all active elections" : undefined,
				studentName: student.name,
				elections: electionStatus,
			};
		},
	});

	return {
		// Mutations
		checkEligibility: checkEligibilityMutation.mutateAsync,

		// Loading states
		isCheckingEligibility: checkEligibilityMutation.isPending,

		// Error states
		eligibilityError: checkEligibilityMutation.error?.message,
	};
};

export type { VotingEligibilityCheck };
