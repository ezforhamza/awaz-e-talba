import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Candidate {
	id: string;
	name: string;
	profile_image_url?: string;
	election_symbol_url?: string;
	position: number;
	description?: string;
}

interface ElectionResult {
	id: string;
	title: string;
	category: string;
	description?: string;
	status: string;
	start_date: string;
	end_date: string;
	total_votes: number;
	candidates: (Candidate & { vote_count: number })[];
}

interface VoteRecord {
	id: string;
	voted_at: string;
	candidate: {
		id: string;
		name: string;
		profile_image_url?: string;
	};
	election: {
		id: string;
		title: string;
		category: string;
	};
	voter: {
		id: string;
		name: string;
		voting_id: string;
		roll_number: string;
	};
	voter_sequence: number;
}

export function useResultsData() {
	const [elections, setElections] = useState<ElectionResult[]>([]);
	const [votes, setVotes] = useState<VoteRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchElectionsWithResults = useCallback(async () => {
		try {
			// First fetch all elections
			const { data: electionsData, error: electionsError } = await supabase
				.from("elections")
				.select("*")
				.order("created_at", { ascending: false });

			if (electionsError) throw electionsError;

			if (!electionsData) {
				setElections([]);
				return;
			}

			// For each election, get candidates and vote counts
			const electionsWithResults = await Promise.all(
				electionsData.map(async (election) => {
					// Get candidates for this election
					const { data: candidatesData } = await supabase
						.from("candidates")
						.select("*")
						.eq("election_id", election.id)
						.order("position", { ascending: true });

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

					const candidatesWithVotes = (candidatesData || []).map((candidate) => ({
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

			setElections(electionsWithResults as ElectionResult[]);
		} catch (err: any) {
			console.error("Error fetching elections with results:", err);
			setError(err.message);
		}
	}, []);

	const fetchVotes = useCallback(async () => {
		try {
			// Fetch recent votes
			const { data: votesData, error: votesError } = await supabase
				.from("votes")
				.select("*")
				.order("voted_at", { ascending: false })
				.limit(50);

			if (votesError) throw votesError;

			if (!votesData) {
				setVotes([]);
				return;
			}

			// For each vote, get candidate, election, and voter details
			const votesWithDetails = await Promise.all(
				votesData.map(async (vote) => {
					// Get candidate details
					const { data: candidateData } = await supabase
						.from("candidates")
						.select("id, name, profile_image_url")
						.eq("id", vote.candidate_id)
						.single();

					// Get election details
					const { data: electionData } = await supabase
						.from("elections")
						.select("id, title, category")
						.eq("id", vote.election_id)
						.single();

					// Get voter details using voting_id
					const { data: voterData } = await supabase
						.from("students")
						.select("id, name, voting_id, roll_number")
						.eq("voting_id", vote.student_voting_id)
						.single();

					return {
						...vote,
						candidate: candidateData || { id: vote.candidate_id, name: "Unknown", profile_image_url: null },
						election: electionData || { id: vote.election_id, title: "Unknown", category: "Unknown" },
						voter: voterData || {
							id: vote.student_voting_id,
							name: "Unknown Voter",
							voting_id: "N/A",
							roll_number: "N/A",
						},
					};
				}),
			);

			// Add sequential voter numbers (for anonymity)
			const votesWithSequence = votesWithDetails.map((vote, index) => ({
				...vote,
				voter_sequence: votesWithDetails.length - index,
			}));

			setVotes(votesWithSequence as VoteRecord[]);
		} catch (err: any) {
			console.error("Error fetching votes:", err);
			setError(err.message);
		}
	}, []);

	const fetchData = useCallback(async () => {
		setLoading(true);
		await Promise.all([fetchElectionsWithResults(), fetchVotes()]);
		setLoading(false);
	}, [fetchElectionsWithResults, fetchVotes]);

	useEffect(() => {
		fetchData();

		// Set up real-time subscriptions for immediate updates
		const votesSubscription = supabase
			.channel("results-votes-realtime")
			.on("postgres_changes", { event: "*", schema: "public", table: "votes" }, (payload) => {
				console.log("Vote change detected:", payload.eventType);
				// Update data immediately without full refresh
				fetchData();
			})
			.subscribe();

		const electionsSubscription = supabase
			.channel("results-elections-realtime")
			.on("postgres_changes", { event: "*", schema: "public", table: "elections" }, (payload) => {
				console.log("Election change detected:", payload.eventType);
				fetchData();
			})
			.subscribe();

		const candidatesSubscription = supabase
			.channel("results-candidates-realtime")
			.on("postgres_changes", { event: "*", schema: "public", table: "candidates" }, (payload) => {
				console.log("Candidate change detected:", payload.eventType);
				fetchData();
			})
			.subscribe();

		return () => {
			supabase.removeChannel(votesSubscription);
			supabase.removeChannel(electionsSubscription);
			supabase.removeChannel(candidatesSubscription);
		};
	}, [fetchData]);

	return {
		elections,
		votes,
		loading,
		error,
		refetch: fetchData,
	};
}
