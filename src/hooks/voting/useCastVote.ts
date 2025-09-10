import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { createVoteHash, type VotingSession } from "@/utils/security";

interface CastVoteData {
	electionId: string;
	candidateId: string;
	votingId: string;
}

interface VoteResult {
	success: boolean;
	voteId?: string;
	sessionId?: string;
	message: string;
	remainingElections?: string[];
}

export const useCastVote = (
	currentSession: VotingSession | null,
	updateVotingProgress: (electionId: string) => void,
	getRemainingElections: (votingId: string) => Promise<any[]>,
) => {
	// Cast a vote
	const castVoteMutation = useMutation({
		mutationFn: async (voteData: CastVoteData): Promise<VoteResult> => {
			if (!currentSession) {
				throw new Error("No active voting session");
			}

			// Check if already voted in this election
			const electionsVoted = currentSession.elections_voted as string[];
			if (electionsVoted.includes(voteData.electionId)) {
				throw new Error("Already voted in this election");
			}

			// Create vote hash for integrity
			const voteHash = await createVoteHash(currentSession.id, new Date().toISOString());

			// Cast the vote
			const { data: vote, error: voteError } = await supabase
				.from("votes")
				.insert({
					election_id: voteData.electionId,
					candidate_id: voteData.candidateId,
					student_voting_id: voteData.votingId,
					voting_session_id: currentSession.id,
					encrypted_voter_hash: currentSession.encrypted_voter_hash,
					vote_hash: voteHash,
					ip_address: currentSession.ip_address,
					user_agent: currentSession.user_agent,
				})
				.select()
				.single();

			if (voteError) {
				throw new Error(voteError.message);
			}

			// Update voting session
			const updatedElectionsVoted = [...electionsVoted, voteData.electionId];
			const { error: sessionError } = await supabase
				.from("voting_sessions")
				.update({
					elections_voted: updatedElectionsVoted,
					updated_at: new Date().toISOString(),
				})
				.eq("id", currentSession.id);

			if (sessionError) {
				console.error("Failed to update session:", sessionError);
			}

			// Log successful vote
			await supabase.from("vote_audit_log").insert({
				action_type: "vote_cast",
				voting_session_id: currentSession.id,
				election_id: voteData.electionId,
				details: {
					candidate_id: voteData.candidateId,
					vote_hash: voteHash,
				},
				ip_address: currentSession.ip_address,
				user_agent: currentSession.user_agent,
			});

			// Update session and progress
			updateVotingProgress(voteData.electionId);

			// Check if all elections completed
			const remainingElections = await getRemainingElections(voteData.votingId);

			return {
				success: true,
				voteId: vote.id,
				sessionId: currentSession.id,
				message: "Vote cast successfully",
				remainingElections: remainingElections.map((e) => e.id),
			};
		},
	});

	return {
		// Mutations
		castVote: castVoteMutation.mutateAsync,

		// Loading states
		isCastingVote: castVoteMutation.isPending,

		// Error states
		voteError: castVoteMutation.error?.message,
	};
};

export type { CastVoteData, VoteResult };
