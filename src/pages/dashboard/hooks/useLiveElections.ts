import { useState, useEffect } from "react";
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

export function useLiveElections() {
	const [elections, setElections] = useState<LiveElection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchLiveElections = async () => {
		try {
			setLoading(true);

			// Fetch active elections with candidates and vote counts
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
				setError(null);
				setLoading(false);
				return;
			}

			// For each election, get vote counts for candidates
			const electionsWithVotes = await Promise.all(
				activeElections.map(async (election) => {
					// Get vote counts for this election
					const { data: voteCounts } = await supabase
						.from("votes")
						.select("candidate_id")
						.eq("election_id", election.id);

					// Count votes per candidate
					const voteCountMap: Record<string, number> = {};
					if (voteCounts) {
						voteCounts.forEach((vote) => {
							voteCountMap[vote.candidate_id] = (voteCountMap[vote.candidate_id] || 0) + 1;
						});
					}

					// Add vote counts to candidates
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

			setElections(electionsWithVotes as LiveElection[]);
			setError(null);
		} catch (err: any) {
			console.error("Error fetching live elections:", err);
			setError(err.message);
			setElections([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLiveElections();

		// Set up real-time subscription for vote changes
		const votesSubscription = supabase
			.channel("live-votes-dashboard")
			.on("postgres_changes", { event: "*", schema: "public", table: "votes" }, () => {
				// Debounce updates to avoid too frequent refreshes
				setTimeout(fetchLiveElections, 100);
			})
			.subscribe();

		// Set up real-time subscription for election changes
		const electionsSubscription = supabase
			.channel("live-elections-dashboard")
			.on("postgres_changes", { event: "*", schema: "public", table: "elections" }, () => {
				setTimeout(fetchLiveElections, 100);
			})
			.subscribe();

		// Refresh every 10 seconds as fallback for missed updates
		const interval = setInterval(fetchLiveElections, 10000);

		return () => {
			supabase.removeChannel(votesSubscription);
			supabase.removeChannel(electionsSubscription);
			clearInterval(interval);
		};
	}, []);

	return { elections, loading, error, refetch: fetchLiveElections };
}
