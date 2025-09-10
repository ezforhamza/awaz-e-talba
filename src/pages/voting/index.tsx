import { useState, useEffect } from "react";
import { useVoting } from "@/hooks/voting";
import { VotingIdInput } from "@/components/voting/VotingIdInput";
import { ElectionCard } from "@/components/voting/ElectionCard";
import { CandidateSelection } from "@/components/voting/CandidateSelection";
import { VotingProgress } from "@/components/voting/VotingProgress";
import { Alert, AlertDescription } from "@/ui/alert";
import { Button } from "@/ui/button";
import { CheckCircle, RefreshCw } from "lucide-react";

type ViewState = "input" | "elections" | "voting" | "complete";

interface SelectedElection {
	id: string;
	title: string;
	description?: string;
	category: string;
	candidates: Array<{
		id: string;
		name: string;
		description?: string;
		profile_image_url?: string;
		election_symbol_url?: string;
		position: number;
	}>;
}

export default function VotingPage() {
	const [viewState, setViewState] = useState<ViewState>("input");
	const [votingId, setVotingId] = useState("");
	const [studentName, setStudentName] = useState("");
	const [selectedElection, setSelectedElection] = useState<SelectedElection | null>(null);
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
		isSessionActive,
		hasCompletedAllElections,
	} = useVoting();

	const handleVotingIdSubmit = async (id: string) => {
		try {
			// Check eligibility first
			const eligibility = await checkEligibility(id);

			if (eligibility.isEligible) {
				setVotingId(id);
				setStudentName(eligibility.studentName || "");
				setEligibleElections(eligibility.elections);

				// Initialize voting session
				await initializeVoting(id);
				setViewState("elections");
			}
		} catch (error) {
			console.error("Voting ID validation failed:", error);
		}
	};

	const handleElectionSelect = (electionId: string) => {
		const election = eligibleElections.find((e) => e.id === electionId && !e.hasVoted);
		if (election) {
			// Fetch full election details with candidates
			setSelectedElection({
				id: election.id,
				title: election.title,
				description: election.description,
				category: election.category,
				candidates: election.candidates || [],
			});
			setViewState("voting");
		}
	};

	const handleVoteCast = async (candidateId: string) => {
		if (!selectedElection) return;

		try {
			const result = await castVote({
				electionId: selectedElection.id,
				candidateId,
				votingId,
			});

			if (result.success) {
				// Update local election state
				setEligibleElections((prev) =>
					prev.map((election) => (election.id === selectedElection.id ? { ...election, hasVoted: true } : election)),
				);

				// Check if voting is complete
				if (result.remainingElections?.length === 0) {
					setViewState("complete");
				} else {
					setViewState("elections");
				}
			}
		} catch (error) {
			console.error("Vote casting failed:", error);
		}
	};

	const handleCompleteVoting = async () => {
		try {
			await completeSession();
			setViewState("input");
			setVotingId("");
			setStudentName("");
			setEligibleElections([]);
			setSelectedElection(null);
		} catch (error) {
			console.error("Session completion failed:", error);
		}
	};

	// Auto-complete when all elections are done
	useEffect(() => {
		if (hasCompletedAllElections && viewState === "elections") {
			setViewState("complete");
		}
	}, [hasCompletedAllElections, viewState]);

	if (viewState === "input") {
		return <VotingIdInput onSubmit={handleVotingIdSubmit} isLoading={isCheckingEligibility} error={eligibilityError} />;
	}

	if (viewState === "voting" && selectedElection) {
		return (
			<CandidateSelection
				election={selectedElection}
				onBack={() => setViewState("elections")}
				onVote={handleVoteCast}
				isVoting={isCastingVote}
			/>
		);
	}

	if (viewState === "complete") {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
				<div className="text-center space-y-6 max-w-md">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-green-900">Voting Complete!</h1>
						<p className="text-green-700 mt-2">
							Thank you for participating in the elections. Your votes have been securely recorded.
						</p>
					</div>
					<Button onClick={handleCompleteVoting} variant="outline">
						<RefreshCw className="w-4 h-4 mr-2" />
						Vote Again
					</Button>
				</div>
			</div>
		);
	}

	const availableElections = eligibleElections.filter((e) => !e.hasVoted);

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="max-w-6xl mx-auto space-y-6">
				<VotingProgress
					totalElections={votingProgress.totalElections}
					completedElections={votingProgress.completedElections}
					currentElection={votingProgress.currentElection}
					studentName={studentName}
				/>

				{voteError && (
					<Alert variant="destructive">
						<AlertDescription>{voteError}</AlertDescription>
					</Alert>
				)}

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{availableElections.map((election) => (
						<ElectionCard
							key={election.id}
							election={election}
							onVote={handleElectionSelect}
							onViewCandidates={handleElectionSelect}
							isVoting={isCastingVote}
						/>
					))}
				</div>

				{availableElections.length === 0 && (
					<div className="text-center py-12">
						<p className="text-muted-foreground">No more elections available to vote in.</p>
					</div>
				)}
			</div>
		</div>
	);
}
