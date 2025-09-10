import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useVoting } from "@/hooks/voting";
import { ThemeProvider } from "@/theme/theme-provider";
import { toast } from "sonner";
import { ThemeToggle, SimplifiedVotingBooth } from "@/components/voting";

// Voting Booth Page Component
const VotingBoothPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [eligibleElections, setEligibleElections] = useState<any[]>([]);

	const { castVote, completeSession, isCastingVote, voteError } = useVoting();

	// Get data from navigation state
	const votingId = location.state?.votingId;
	const studentName = location.state?.studentName;
	const elections = location.state?.elections;

	useEffect(() => {
		// Redirect to entry if no data
		if (!votingId || !studentName || !elections) {
			toast.error("Please enter your voting ID first");
			navigate("/vote-entry");
			return;
		}

		setEligibleElections(elections);
	}, [votingId, studentName, elections, navigate]);

	const handleVoteCast = async (electionId: string, candidateId: string) => {
		try {
			const result = await castVote({
				electionId,
				candidateId,
				votingId,
			});

			if (result.success) {
				// Update local election state
				setEligibleElections((prev) =>
					prev.map((election) => (election.id === electionId ? { ...election, hasVoted: true } : election)),
				);

				const electionTitle = eligibleElections.find((e) => e.id === electionId)?.title || "Election";
				toast.success(`Vote cast successfully for ${electionTitle}!`);
			}
		} catch (error) {
			console.error("Vote casting failed:", error);
			toast.error(voteError || "Failed to cast vote. Please try again.");
			throw error; // Re-throw to handle in component
		}
	};

	const handleNextStudent = () => {
		// Navigate back to entry for next student
		navigate("/vote-entry");
		toast.info("Ready for next student. Please enter voting ID.");
	};

	const handleCompleteVoting = async () => {
		try {
			await completeSession();
			navigate("/vote-entry");
			toast.info("Session ended. You can start a new voting session.");
		} catch (error) {
			console.error("Session completion failed:", error);
			toast.error("Failed to complete session. Please try again.");
		}
	};

	// Show loading if data not available
	if (!votingId || !studentName || !elections) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">Redirecting...</p>
				</div>
			</div>
		);
	}

	return (
		<SimplifiedVotingBooth
			student={{ name: studentName, voting_id: votingId }}
			elections={eligibleElections}
			onVote={handleVoteCast}
			onCompleteVoting={handleCompleteVoting}
			onNextStudent={handleNextStudent}
			isSubmitting={isCastingVote}
		/>
	);
};

// Wrapped component with Theme Provider
export default function VoteBoothPage() {
	return (
		<ThemeProvider>
			<div className="relative min-h-screen bg-background">
				<ThemeToggle />
				<VotingBoothPage />
			</div>
		</ThemeProvider>
	);
}
