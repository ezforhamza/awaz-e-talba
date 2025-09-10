import { useState, useEffect } from "react";
import { useVoting } from "@/hooks/voting";
import { ThemeProvider } from "@/theme/theme-provider";
import { toast } from "sonner";
import { ThemeToggle, VotingIdStep, SimplifiedVotingBooth } from "@/components/voting";

// Main Voting Page Component
const VotingPage = () => {
	const [viewState, setViewState] = useState<"input" | "voting">("input");
	const [votingId, setVotingId] = useState("");
	const [studentName, setStudentName] = useState("");
	const [eligibleElections, setEligibleElections] = useState<any[]>([]);

	const {
		checkEligibility,
		initializeVoting,
		castVote,
		completeSession,
		votingProgress,
		isCheckingEligibility,
		isCastingVote,
		eligibilityError,
		voteError,
		hasCompletedAllElections,
	} = useVoting();

	const handleVotingIdSubmit = async (id: string) => {
		console.log("🔍 Starting voting ID submission for:", id);
		try {
			// Check eligibility first
			console.log("🔍 Checking eligibility...");
			const eligibility = await checkEligibility(id);
			console.log("🔍 Eligibility result:", eligibility);

			if (eligibility.isEligible) {
				console.log("✅ Eligibility confirmed, setting up voting session...");
				setVotingId(id);
				setStudentName(eligibility.studentName || "");
				setEligibleElections(eligibility.elections);

				// Initialize voting session
				console.log("🔍 Initializing voting session...");
				const sessionResult = await initializeVoting(id);
				console.log("🔍 Session initialization result:", sessionResult);

				setViewState("voting");
				toast.success(
					`Welcome ${eligibility.studentName}! ${eligibility.elections.filter((e) => !e.hasVoted).length} elections available.`,
				);
			} else {
				console.error("❌ Not eligible:", eligibility.reason);
				toast.error(eligibility.reason || "Not eligible to vote");
			}
		} catch (error) {
			console.error("❌ Voting ID validation failed:", error);
			toast.error(`Failed to validate voting ID: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	};

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
		// Reset to input state for next student
		setViewState("input");
		setVotingId("");
		setStudentName("");
		setEligibleElections([]);
		toast.info("Ready for next student. Please enter voting ID.");
	};

	const handleCompleteVoting = async () => {
		try {
			await completeSession();
			setViewState("input");
			setVotingId("");
			setStudentName("");
			setEligibleElections([]);
			toast.info("Session ended. You can start a new voting session.");
		} catch (error) {
			console.error("Session completion failed:", error);
			toast.error("Failed to complete session. Please try again.");
		}
	};

	if (viewState === "input") {
		return (
			<VotingIdStep onVerify={handleVotingIdSubmit} isVerifying={isCheckingEligibility} error={eligibilityError} />
		);
	}

	if (viewState === "voting") {
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
	}

	return null;
};

// Wrapped component with Theme Provider
export default function VotePage() {
	return (
		<ThemeProvider>
			<div className="relative min-h-screen bg-background">
				<ThemeToggle />
				<VotingPage />
			</div>
		</ThemeProvider>
	);
}
