import { useState } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Alert, AlertDescription } from "@/ui/alert";
import { CheckCircle, Users, Shield, User, RefreshCw, ArrowRight, Loader2, Vote } from "lucide-react";

interface Student {
	name: string;
	voting_id: string;
}

interface Candidate {
	id: string;
	name: string;
	description?: string;
	profile_image_url?: string;
	election_symbol_url?: string;
	position: number;
}

interface Election {
	id: string;
	title: string;
	category: string;
	description?: string;
	candidates: Candidate[];
	hasVoted: boolean;
}

interface SimplifiedVotingBoothProps {
	student: Student;
	elections: Election[];
	onVote: (electionId: string, candidateId: string) => Promise<void>;
	onCompleteVoting: () => void;
	onNextStudent: () => void;
	isSubmitting: boolean;
}

export function SimplifiedVotingBooth({
	student,
	elections,
	onVote,
	onCompleteVoting,
	onNextStudent,
	isSubmitting,
}: SimplifiedVotingBoothProps) {
	const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
	const [submittingElections, setSubmittingElections] = useState<Set<string>>(new Set());

	const availableElections = elections.filter((e) => !e.hasVoted);
	const completedCount = elections.filter((e) => e.hasVoted).length;
	const totalElections = elections.length;

	const handleCandidateSelect = (electionId: string, candidateId: string) => {
		setSelectedVotes((prev) => ({
			...prev,
			[electionId]: candidateId,
		}));
	};

	const handleSubmitVote = async (electionId: string) => {
		const candidateId = selectedVotes[electionId];
		if (!candidateId) return;

		// Mark this election as submitting
		setSubmittingElections((prev) => new Set([...prev, electionId]));

		try {
			await onVote(electionId, candidateId);

			// Remove from selected votes after successful submission
			setSelectedVotes((prev) => {
				const newVotes = { ...prev };
				delete newVotes[electionId];
				return newVotes;
			});
		} catch (error) {
			console.error("Vote submission failed:", error);
		} finally {
			// Remove from submitting state
			setSubmittingElections((prev) => {
				const newSet = new Set(prev);
				newSet.delete(electionId);
				return newSet;
			});
		}
	};

	const allVotesCompleted = availableElections.length === 0;

	if (allVotesCompleted) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-6">
				<Card className="w-full max-w-lg shadow-2xl bg-card/95 backdrop-blur-sm">
					<CardContent className="text-center p-12">
						<div className="flex justify-center mb-8">
							<div className="p-6 bg-primary/10 rounded-full shadow-2xl animate-bounce">
								<CheckCircle className="w-16 h-16 text-primary" />
							</div>
						</div>

						<h2 className="text-4xl font-bold text-foreground mb-4">🎉 All Votes Submitted!</h2>

						<p className="text-muted-foreground text-lg mb-8 leading-relaxed">
							Thank you <span className="font-semibold">{student.name}</span>! Your votes have been recorded securely.
						</p>

						<div className="space-y-4">
							<Button
								onClick={onNextStudent}
								className="w-full h-16 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
							>
								<ArrowRight className="w-7 h-7 mr-3" />
								Next Student
							</Button>

							<Button onClick={onCompleteVoting} variant="outline" className="w-full h-12 text-base">
								<RefreshCw className="w-5 h-5 mr-2" />
								End Voting Session
							</Button>
						</div>

						<div className="mt-8 pt-6 border-t">
							<div className="text-center space-y-3">
								<div className="flex justify-center items-center gap-3 text-primary">
									<Shield className="w-6 h-6" />
									<span className="text-base font-semibold">Your votes are anonymous and secure</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<Card className="mb-8 shadow-xl bg-card/95 backdrop-blur-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<Avatar className="h-16 w-16 border-4 border-background shadow-lg">
									<AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
										{student.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div>
									<h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
									<p className="text-muted-foreground font-mono">ID: {student.voting_id}</p>
								</div>
							</div>

							<div className="text-center">
								<div className="bg-primary/10 rounded-xl p-4">
									<div className="text-3xl font-bold text-primary">
										{completedCount} / {totalElections}
									</div>
									<div className="text-sm text-muted-foreground">Elections Completed</div>
								</div>
							</div>

							<Button onClick={onNextStudent} variant="outline" className="h-12 px-6">
								<ArrowRight className="w-5 h-5 mr-2" />
								Next Student
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Voting Progress */}
				<Card className="mb-8 shadow-xl bg-card/95 backdrop-blur-sm">
					<CardContent className="p-6">
						<div className="flex justify-between text-sm text-muted-foreground mb-2">
							<span>Voting Progress</span>
							<span>{Math.round((completedCount / totalElections) * 100)}%</span>
						</div>
						<div className="w-full bg-muted rounded-full h-4">
							<div
								className="bg-primary h-4 rounded-full transition-all duration-500"
								style={{ width: `${(completedCount / totalElections) * 100}%` }}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Elections Grid */}
				<div className="grid gap-6 lg:grid-cols-2">
					{availableElections.map((election) => (
						<Card key={election.id} className="shadow-xl bg-card/95 backdrop-blur-sm">
							<CardHeader className="pb-4">
								<CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
									<Vote className="w-7 h-7 text-primary" />
									{election.title}
								</CardTitle>
								<div className="flex items-center gap-3">
									<Badge variant="secondary">{election.category}</Badge>
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<Users className="w-4 h-4" />
										<span>{election.candidates.length} candidates</span>
									</div>
								</div>
								{election.description && <p className="text-muted-foreground">{election.description}</p>}
							</CardHeader>

							<CardContent className="space-y-3">
								<div className="grid gap-3">
									{election.candidates.map((candidate) => (
										<div
											key={candidate.id}
											className={`group p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
												selectedVotes[election.id] === candidate.id
													? "border-primary bg-primary/5 shadow-md"
													: "border-border hover:border-primary/50 bg-card hover:bg-muted/30"
											}`}
											onClick={() => handleCandidateSelect(election.id, candidate.id)}
										>
											<div className="flex items-center gap-3">
												{/* Candidate Profile Image */}
												<div className="relative">
													<Avatar className="h-16 w-16 border-2 border-background shadow-sm">
														<AvatarImage src={candidate.profile_image_url || ""} className="object-cover" />
														<AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
															{candidate.name.charAt(0)}
														</AvatarFallback>
													</Avatar>
												</div>

												{/* Candidate Info */}
												<div className="flex-1 min-w-0">
													<h4 className="font-bold text-base text-foreground truncate">{candidate.name}</h4>
													{candidate.description && (
														<p className="text-sm text-muted-foreground line-clamp-2">{candidate.description}</p>
													)}
												</div>

												{/* Election Symbol */}
												<div className="flex items-center gap-3">
													{candidate.election_symbol_url && (
														<div className="relative">
															<img
																src={candidate.election_symbol_url}
																alt={`${candidate.name} symbol`}
																className="w-12 h-12 object-contain border-2 border-muted rounded-lg bg-background p-1"
															/>
														</div>
													)}

													{/* Selection Indicator */}
													<div className="flex-shrink-0">
														{selectedVotes[election.id] === candidate.id ? (
															<CheckCircle className="w-6 h-6 text-primary" />
														) : (
															<div className="w-6 h-6 border-2 border-border rounded-full group-hover:border-primary/50 transition-colors" />
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>

								<div className="pt-4">
									<Button
										onClick={() => handleSubmitVote(election.id)}
										disabled={!selectedVotes[election.id] || submittingElections.has(election.id)}
										className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
									>
										{submittingElections.has(election.id) ? (
											<>
												<Loader2 className="w-5 h-5 mr-2 animate-spin" />
												Submitting Vote...
											</>
										) : (
											<>
												<CheckCircle className="w-5 h-5 mr-2" />
												Submit Vote for {election.title}
											</>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
