import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Candidate {
	id: string;
	name: string;
	profile_image_url?: string;
	vote_count: number;
}

interface LiveElection {
	id: string;
	title: string;
	category: string;
	description?: string;
	end_date: string;
	total_votes: number;
	candidates: Candidate[];
}

export function useOptimizedLiveElections() {
	const [elections, setElections] = useState<LiveElection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const electionsRef = useRef<LiveElection[]>([]);

	// Update specific election data without full re-render
	const updateElectionVotes = useCallback((electionId: string, candidateId: string) => {
		setElections((prevElections) => {
			const newElections = prevElections.map((election) => {
				if (election.id !== electionId) return election;

				// Update candidate vote count
				const updatedCandidates = election.candidates.map((candidate) => {
					if (candidate.id === candidateId) {
						return { ...candidate, vote_count: candidate.vote_count + 1 };
					}
					return candidate;
				});

				// Update total votes
				const newTotalVotes = election.total_votes + 1;

				return {
					...election,
					candidates: updatedCandidates,
					total_votes: newTotalVotes,
				};
			});

			electionsRef.current = newElections;
			return newElections;
		});
	}, []);

	const fetchLiveElections = useCallback(
		async (force = false) => {
			try {
				if (!force && !loading) return; // Don't fetch if already loaded unless forced

				setLoading(true);

				// Fetch active elections with candidates
				const { data: activeElections, error: electionsError } = await supabase
					.from("elections")
					.select(`
          id,
          title,
          category,
          description,
          end_date,
          candidates (
            id,
            name,
            profile_image_url
          )
        `)
					.eq("status", "active")
					.lte("start_date", new Date().toISOString())
					.gte("end_date", new Date().toISOString())
					.order("created_at", { ascending: false });

				if (electionsError) {
					throw electionsError;
				}

				if (!activeElections || activeElections.length === 0) {
					setElections([]);
					electionsRef.current = [];
					setError(null);
					setLoading(false);
					return;
				}

				// For each election, get vote counts
				const electionsWithVotes = await Promise.all(
					activeElections.map(async (election) => {
						// Get vote counts for this election
						const { data: voteCounts } = await supabase
							.from("votes")
							.select("candidate_id")
							.eq("election_id", election.id);

						const voteCountMap: Record<string, number> = {};
						if (voteCounts) {
							voteCounts.forEach((vote) => {
								voteCountMap[vote.candidate_id] = (voteCountMap[vote.candidate_id] || 0) + 1;
							});
						}

						const candidatesWithVotes = (election.candidates || []).map((candidate) => ({
							...candidate,
							vote_count: voteCountMap[candidate.id] || 0,
						}));

						const totalVotes = Object.values(voteCountMap).reduce((sum, count) => sum + count, 0);

						return {
							...election,
							candidates: candidatesWithVotes,
							total_votes: totalVotes,
						};
					}),
				);

				const newElections = electionsWithVotes as LiveElection[];
				setElections(newElections);
				electionsRef.current = newElections;
				setError(null);
			} catch (err: any) {
				console.error("Error fetching live elections:", err);
				setError(err.message);
				setElections([]);
				electionsRef.current = [];
			} finally {
				setLoading(false);
			}
		},
		[loading],
	);

	useEffect(() => {
		fetchLiveElections();

		// Set up optimized real-time subscription
		const votesSubscription = supabase
			.channel("optimized-live-votes")
			.on("postgres_changes", { event: "INSERT", schema: "public", table: "votes" }, (payload) => {
				console.log("New vote detected:", payload);

				// Try to update incrementally first
				if (payload.new && payload.new.election_id && payload.new.candidate_id) {
					const { election_id, candidate_id } = payload.new;

					// Check if we have this election in current state
					const hasElection = electionsRef.current.some((e) => e.id === election_id);

					if (hasElection) {
						// Update incrementally
						updateElectionVotes(election_id, candidate_id);
						return;
					}
				}

				// Fallback to full refresh if incremental update not possible
				fetchLiveElections(true);
			})
			.on("postgres_changes", { event: "UPDATE", schema: "public", table: "elections" }, () => {
				// Election status changes require full refresh
				fetchLiveElections(true);
			})
			.on("postgres_changes", { event: "*", schema: "public", table: "candidates" }, () => {
				// Candidate changes require full refresh
				fetchLiveElections(true);
			})
			.subscribe();

		return () => {
			supabase.removeChannel(votesSubscription);
		};
	}, [fetchLiveElections, updateElectionVotes]);

	return {
		elections: elections,
		loading,
		error,
		refetch: () => fetchLiveElections(true),
	};
}
