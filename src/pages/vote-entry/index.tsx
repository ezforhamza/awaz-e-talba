import { useState } from "react";
import { useNavigate } from "react-router";
import { useVoting } from "@/hooks/voting";
import { ThemeProvider } from "@/theme/theme-provider";
import { toast } from "sonner";
import { ThemeToggle, VotingIdStep } from "@/components/voting";

// Voting ID Entry Page Component
const VotingEntryPage = () => {
	const navigate = useNavigate();
	const { checkEligibility, initializeVoting, isCheckingEligibility, eligibilityError } = useVoting();

	const handleVotingIdSubmit = async (id: string) => {
		console.log("🔍 Starting voting ID submission for:", id);
		try {
			// Check eligibility first
			console.log("🔍 Checking eligibility...");
			const eligibility = await checkEligibility(id);
			console.log("🔍 Eligibility result:", eligibility);

			if (eligibility.isEligible) {
				console.log("✅ Eligibility confirmed, setting up voting session...");

				// Initialize voting session
				console.log("🔍 Initializing voting session...");
				const sessionResult = await initializeVoting(id);
				console.log("🔍 Session initialization result:", sessionResult);

				if (sessionResult.success) {
					// Navigate to voting booth with state
					navigate("/vote-booth", {
						state: {
							votingId: id,
							studentName: eligibility.studentName,
							elections: eligibility.elections,
						},
					});
					toast.success(
						`Welcome ${eligibility.studentName}! ${eligibility.elections.filter((e) => !e.hasVoted).length} elections available.`,
					);
				} else {
					toast.error(sessionResult.message || "Failed to initialize voting session");
				}
			} else {
				console.error("❌ Not eligible:", eligibility.reason);
				toast.error(eligibility.reason || "Not eligible to vote");
			}
		} catch (error) {
			console.error("❌ Voting ID validation failed:", error);
			toast.error(`Failed to validate voting ID: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	};

	return <VotingIdStep onVerify={handleVotingIdSubmit} isVerifying={isCheckingEligibility} error={eligibilityError} />;
};

// Wrapped component with Theme Provider
export default function VoteEntryPage() {
	return (
		<ThemeProvider>
			<div className="relative min-h-screen bg-background">
				<ThemeToggle />
				<VotingEntryPage />
			</div>
		</ThemeProvider>
	);
}
