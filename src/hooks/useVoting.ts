import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface VotingStudent {
	id: string;
	name: string;
	roll_number: string;
	class: string | null;
	section: string | null;
	voting_id: string;
	is_active: boolean;
	admin_id: string;
}

interface VotingElection {
	id: string;
	title: string;
	description: string | null;
	status: "active" | "draft" | "completed" | "cancelled";
	start_date: string;
	end_date: string;
	allow_multiple_votes: boolean;
}

interface VotingCandidate {
	id: string;
	name: string;
	description: string | null;
	image_url: string | null;
	position: number;
}

interface VoteSubmissionData {
	election_id: string;
	candidate_id: string;
	student_voting_id: string;
	ip_address?: string;
	user_agent?: string;
}

export const useVoting = () => {
	const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
	const [votingSession, setVotingSession] = useState<{
		student: VotingStudent | null;
		election: VotingElection | null;
		candidates: VotingCandidate[];
		hasVoted: boolean;
	}>({
		student: null,
		election: null,
		candidates: [],
		hasVoted: false,
	});

	// Get all active elections
	const { data: activeElections, isLoading: electionLoading } = useQuery({
		queryKey: ["active-elections"],
		queryFn: async () => {
			const now = new Date().toISOString();
			
			// Get all active elections that are currently running (within time window)
			const { data: elections, error: electionError } = await supabase
				.from("elections")
				.select(`
          id,
          title,
          description,
          status,
          start_date,
          end_date,
          allow_multiple_votes
        `)
				.eq("status", "active")
				.lte("start_date", now)  // Election has started
				.gte("end_date", now)    // Election hasn't ended yet
				.order("created_at", { ascending: false });

			if (electionError) {
				throw new Error(electionError.message);
			}

			if (!elections || elections.length === 0) {
				return [];
			}

			// Return elections as array of VotingElection objects
			return elections.map(election => ({
				id: election.id,
				title: election.title,
				description: election.description,
				status: election.status as "active" | "draft" | "completed" | "cancelled",
				start_date: election.start_date,
				end_date: election.end_date,
				allow_multiple_votes: election.allow_multiple_votes,
			})) as VotingElection[];
		},
	});

	// Get candidates for selected election
	const { data: candidates } = useQuery({
		queryKey: ["election-candidates", selectedElectionId],
		queryFn: async () => {
			if (!selectedElectionId) return [];

			const { data: candidatesData, error: candidatesError } = await supabase
				.from("election_candidates")
				.select(`
          candidate_id,
          candidates!inner (
            id,
            name,
            description,
            image_url,
            position
          )
        `)
				.eq("election_id", selectedElectionId)
				.order("candidates(position)", { ascending: true });

			if (candidatesError) {
				throw new Error(`Failed to load candidates: ${candidatesError.message}`);
			}

			return (
				(candidatesData?.map((item: any) => ({
					id: item.candidates.id,
					name: item.candidates.name,
					description: item.candidates.description,
					image_url: item.candidates.image_url,
					position: item.candidates.position,
				})) as VotingCandidate[]) || []
			);
		},
		enabled: !!selectedElectionId,
	});

	// Verify student by voting ID
	const verifyStudentMutation = useMutation({
		mutationFn: async (votingId: string) => {
			// Always reset session first to clear any cached state
			setVotingSession({
				student: null,
				election: null,
				candidates: [],
				hasVoted: false,
			});

			const normalizedVotingId = votingId.toUpperCase().trim();

			const { data: student, error: studentError } = await supabase
				.from("students")
				.select("id, name, roll_number, class, section, voting_id, is_active, admin_id")
				.eq("voting_id", normalizedVotingId)
				.eq("is_active", true)
				.single();

			if (studentError) {
				if (studentError.code === "PGRST116") {
					throw new Error("Invalid voting ID. Please check your voting ID and try again.");
				}
				throw new Error("Failed to verify voting ID. Please try again.");
			}

			if (!selectedElectionId || !activeElections || activeElections.length === 0) {
				throw new Error("No election selected. Please select an election first.");
			}

			const selectedElection = activeElections.find((e) => e.id === selectedElectionId);
			if (!selectedElection) {
				throw new Error("Selected election not found. Please try again.");
			}

			// IMPORTANT: Check if student belongs to the same admin as the election
			// This enforces admin isolation on the frontend
			const { data: electionAdminCheck, error: electionError } = await supabase
				.from("elections")
				.select("admin_id")
				.eq("id", selectedElectionId)
				.single();

			if (electionError) {
				console.error("Election admin check error:", electionError);
				throw new Error("Failed to verify election. Please try again.");
			}

			// Check if student's admin matches election's admin
			if (student.admin_id !== electionAdminCheck.admin_id) {
				throw new Error("Access denied: You can only vote in elections created by your admin. This election belongs to a different admin.");
			}

			// IMPORTANT: Always do a fresh check for existing votes (no caching)
			const { data: existingVote, error: voteError } = await supabase
				.from("votes")
				.select("id")
				.eq("election_id", selectedElectionId)
				.eq("student_voting_id", normalizedVotingId)
				.maybeSingle(); // Use maybeSingle instead of single to avoid PGRST116 error

			if (voteError) {
				console.error("Vote check error:", voteError);
				throw new Error("Failed to check voting status. Please try again.");
			}

			const hasVoted = !!existingVote;

			if (hasVoted && !selectedElection.allow_multiple_votes) {
				throw new Error("You have already voted in this election.");
			}

			setVotingSession({
				student: student as VotingStudent,
				election: selectedElection,
				candidates: candidates || [],
				hasVoted,
			});

			return { student: student as VotingStudent, hasVoted };
		},
	});

	// Submit vote
	const submitVoteMutation = useMutation({
		mutationFn: async ({ candidate_id }: { candidate_id: string }) => {
			if (!votingSession.student || !votingSession.election) {
				throw new Error("Invalid voting session. Please start over.");
			}

			const voteData: VoteSubmissionData = {
				election_id: votingSession.election.id,
				candidate_id,
				student_voting_id: votingSession.student.voting_id,
				ip_address: undefined, // Will be handled by RLS policies if needed
				user_agent: navigator.userAgent,
			};

			const { data, error } = await supabase.from("votes").insert([voteData]).select().single();

			if (error) {
				console.error("Vote submission error:", error);
				if (error.code === "23505") {
					throw new Error("You have already voted in this election.");
				}
				throw new Error("Failed to submit vote. Please try again.");
			}

			// Update session to reflect that user has voted
			setVotingSession(prev => ({
				...prev,
				hasVoted: true
			}));

			return data;
		},
		onSuccess: () => {
			// Reset session after successful vote to prevent any caching issues
			setTimeout(() => {
				resetSession();
			}, 2000); // Give time for success message to show
		}
	});

	const resetSession = () => {
		setVotingSession({
			student: null,
			election: null,
			candidates: [],
			hasVoted: false,
		});
		setSelectedElectionId(null);
		
		// Clear any potential mutations state
		verifyStudentMutation.reset();
		submitVoteMutation.reset();
	};

	const selectElection = (electionId: string) => {
		setSelectedElectionId(electionId);
		// Reset session when selecting a new election
		setVotingSession({
			student: null,
			election: null,
			candidates: [],
			hasVoted: false,
		});
	};

	return {
		// Data
		activeElections,
		selectedElectionId,
		candidates,
		votingSession,

		// Loading states
		isLoadingElections: electionLoading,
		isVerifyingStudent: verifyStudentMutation.isPending,
		isSubmittingVote: submitVoteMutation.isPending,

		// Actions
		selectElection,
		verifyStudent: verifyStudentMutation.mutateAsync,
		submitVote: submitVoteMutation.mutateAsync,
		resetSession,

		// Errors
		verificationError: verifyStudentMutation.error?.message,
		submissionError: submitVoteMutation.error?.message,
	};
};
