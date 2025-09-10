import { useVotingEligibility } from "./useVotingEligibility";
import { useVotingSession } from "./useVotingSession";
import { useCastVote } from "./useCastVote";

// Combined hook that provides all voting functionality
export const useVoting = () => {
	const eligibility = useVotingEligibility();
	const session = useVotingSession();
	const vote = useCastVote(session.currentSession, session.updateVotingProgress, session.getRemainingElections);

	return {
		// Eligibility
		...eligibility,

		// Session management
		...session,

		// Vote casting
		...vote,
	};
};

// Re-export types and individual hooks for granular usage
export { useVotingEligibility } from "./useVotingEligibility";
export { useVotingSession } from "./useVotingSession";
export { useCastVote } from "./useCastVote";

export type { VotingEligibilityCheck } from "./useVotingEligibility";
export type { VotingSessionData } from "./useVotingSession";
export type { CastVoteData, VoteResult } from "./useCastVote";
