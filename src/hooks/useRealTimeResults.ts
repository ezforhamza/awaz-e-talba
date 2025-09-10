import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Real-time election results interface
interface CandidateResult {
	candidate_id: string;
	candidate_name: string;
	profile_image_url: string | null;
	election_symbol_url: string | null;
	vote_count: number;
	vote_percentage: number;
	position: number;
}

interface ElectionResult {
	election_id: string;
	election_title: string;
	election_category: string;
	election_status: "draft" | "active" | "completed" | "archived";
	total_votes: number;
	candidates: CandidateResult[];
	last_updated: string;
}

interface RealTimeUpdate {
	type: "vote_cast" | "election_status_changed" | "fraud_detected";
	election_id: string;
	timestamp: string;
	data: any;
}

export const useRealTimeResults = (adminId?: string) => {
	const queryClient = useQueryClient();
	const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
	const [liveUpdates, setLiveUpdates] = useState<RealTimeUpdate[]>([]);
	const [isConnected, setIsConnected] = useState(false);

	// Fetch current election results
	const {
		data: electionResults,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["election-results", adminId],
		enabled: !!adminId,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("get_live_election_results", {
				admin_id_param: adminId,
			});

			if (error) {
				// Fallback to manual query if RPC doesn't exist
				const { data: fallbackData, error: fallbackError } = await supabase
					.from("elections")
					.select(`
            id,
            title,
            category,
            status,
            candidates (
              id,
              name,
              profile_image_url,
              election_symbol_url,
              position
            )
          `)
					.eq("admin_id", adminId)
					.in("status", ["active", "completed"]);

				if (fallbackError) throw new Error(fallbackError.message);

				// Calculate vote counts manually
				const results: ElectionResult[] = await Promise.all(
					fallbackData.map(async (election) => {
						const { data: votes } = await supabase.from("votes").select("candidate_id").eq("election_id", election.id);

						const totalVotes = votes?.length || 0;
						const candidateVotes =
							election.candidates
								?.map((candidate) => {
									const voteCount = votes?.filter((v) => v.candidate_id === candidate.id).length || 0;
									return {
										candidate_id: candidate.id,
										candidate_name: candidate.name,
										profile_image_url: candidate.profile_image_url,
										election_symbol_url: candidate.election_symbol_url,
										vote_count: voteCount,
										vote_percentage: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100 * 100) / 100 : 0,
										position: candidate.position,
									};
								})
								.sort((a, b) => b.vote_count - a.vote_count) || [];

						return {
							election_id: election.id,
							election_title: election.title,
							election_category: election.category,
							election_status: election.status,
							total_votes: totalVotes,
							candidates: candidateVotes,
							last_updated: new Date().toISOString(),
						};
					}),
				);

				return results;
			}

			return data as ElectionResult[];
		},
		refetchInterval: 5000, // Fallback polling every 5 seconds
	});

	// Set up real-time subscriptions
	useEffect(() => {
		if (!adminId) return;

		// Create real-time channel
		const channel = supabase
			.channel("election-results")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "votes",
				},
				(payload) => {
					console.log("New vote received:", payload);

					// Add to live updates
					const update: RealTimeUpdate = {
						type: "vote_cast",
						election_id: payload.new.election_id,
						timestamp: new Date().toISOString(),
						data: payload.new,
					};

					setLiveUpdates((prev) => [update, ...prev.slice(0, 49)]); // Keep last 50 updates

					// Refetch election results
					refetch();

					// Invalidate related queries
					queryClient.invalidateQueries({ queryKey: ["election-results"] });
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "elections",
				},
				(payload) => {
					console.log("Election status changed:", payload);

					const update: RealTimeUpdate = {
						type: "election_status_changed",
						election_id: payload.new.id,
						timestamp: new Date().toISOString(),
						data: payload.new,
					};

					setLiveUpdates((prev) => [update, ...prev.slice(0, 49)]);
					refetch();
					queryClient.invalidateQueries({ queryKey: ["elections"] });
				},
			)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "vote_audit_log",
					filter: "action_type=eq.fraud_attempt",
				},
				(payload) => {
					console.log("Fraud attempt detected:", payload);

					const update: RealTimeUpdate = {
						type: "fraud_detected",
						election_id: payload.new.election_id,
						timestamp: new Date().toISOString(),
						data: payload.new,
					};

					setLiveUpdates((prev) => [update, ...prev.slice(0, 49)]);
				},
			)
			.subscribe((status) => {
				console.log("Realtime subscription status:", status);
				setIsConnected(status === "SUBSCRIBED");
			});

		setRealtimeChannel(channel);

		// Cleanup
		return () => {
			console.log("Unsubscribing from realtime channel");
			supabase.removeChannel(channel);
			setRealtimeChannel(null);
			setIsConnected(false);
		};
	}, [adminId, refetch, queryClient]);

	// Get results for a specific election
	const getElectionResult = (electionId: string) =>
		electionResults?.find((result) => result.election_id === electionId);

	// Get all active election results
	const getActiveResults = () => electionResults?.filter((result) => result.election_status === "active") || [];

	// Get fraud alerts for the last 24 hours
	const getFraudAlerts = () =>
		liveUpdates.filter(
			(update) =>
				update.type === "fraud_detected" && new Date(update.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000),
		);

	// Clear live updates
	const clearUpdates = () => setLiveUpdates([]);

	// Manual refresh
	const refreshResults = () => {
		queryClient.invalidateQueries({ queryKey: ["election-results"] });
		return refetch();
	};

	return {
		// Data
		electionResults: electionResults || [],
		liveUpdates,

		// Connection status
		isConnected,
		isLoading,
		error: error?.message,

		// Helper functions
		getElectionResult,
		getActiveResults,
		getFraudAlerts,
		clearUpdates,
		refreshResults,

		// Real-time channel (for advanced usage)
		realtimeChannel,
	};
};

// Create the database function for optimized results fetching
export const createElectionResultsFunction = async () => {
	const { error } = await supabase.rpc("create_election_results_function");
	if (error) {
		console.warn("Could not create election results function:", error.message);
		return false;
	}
	return true;
};

// Export types
export type { ElectionResult, CandidateResult, RealTimeUpdate };
