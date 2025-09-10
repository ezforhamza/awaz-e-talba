import { useElectionQueries } from "./useElectionQueries";
import { useElectionMutations } from "./useElectionMutations";
import { useElectionActions } from "./useElectionActions";

// Combined hook that provides all election functionality
export const useElections = () => {
	const queries = useElectionQueries();
	const mutations = useElectionMutations();
	const actions = useElectionActions(queries.elections);

	return {
		// Query data
		...queries,

		// Mutations
		...mutations,

		// Actions
		...actions,
	};
};

// Re-export types and individual hooks for granular usage
export { useElectionQueries } from "./useElectionQueries";
export { useElectionMutations } from "./useElectionMutations";
export { useElectionActions } from "./useElectionActions";

export type {
	Election,
	ElectionWithCandidates,
	ElectionStats,
} from "./useElectionQueries";

export type {
	CreateElectionData,
	UpdateElectionData,
} from "./useElectionMutations";
