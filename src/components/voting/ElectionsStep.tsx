import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { CheckCircle, RefreshCw, Vote, Users, ArrowRight, Shield } from "lucide-react";

interface Student {
	name: string;
	voting_id: string;
}

interface Election {
	id: string;
	title: string;
	category: string;
	description?: string;
	candidates?: any[];
	hasVoted: boolean;
}

interface VotingProgress {
	totalElections: number;
	completedElections: number;
}

interface ElectionsStepProps {
	student: Student;
	elections: Election[];
	votingProgress: VotingProgress;
	onElectionSelect: (election: Election) => void;
	onCompleteVoting: () => void;
	hasCompletedAllElections: boolean;
}

export function ElectionsStep({
	student,
	elections,
	votingProgress,
	onElectionSelect,
	onCompleteVoting,
	hasCompletedAllElections,
}: ElectionsStepProps) {
	const availableElections = elections.filter((e) => !e.hasVoted);
	const completedElections = elections.filter((e) => e.hasVoted);

	if (hasCompletedAllElections) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
				<Card className="w-full max-w-lg shadow-2xl bg-card/95 backdrop-blur-sm">
					<CardContent className="text-center p-12">
						<div className="flex justify-center mb-8">
							<div className="p-6 bg-primary/10 rounded-full shadow-2xl animate-pulse">
								<CheckCircle className="w-16 h-16 text-primary" />
							</div>
						</div>

						<h2 className="text-4xl font-bold text-foreground mb-4">All Votes Submitted!</h2>

						<p className="text-muted-foreground text-lg mb-8 leading-relaxed">
							Thank you for participating in all available elections. Your votes have been recorded securely and
							anonymously.
						</p>

						<Button
							onClick={onCompleteVoting}
							className="w-full h-16 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
						>
							<RefreshCw className="w-7 h-7 mr-3" />
							Start New Session
						</Button>

						<div className="mt-8 pt-6 border-t">
							<div className="text-center space-y-3">
								<div className="flex justify-center items-center gap-3 text-primary">
									<Shield className="w-6 h-6" />
									<span className="text-base font-semibold">Your votes are anonymous and secure</span>
								</div>
								<p className="text-sm text-muted-foreground">
									No one can see how you voted. Your privacy is protected.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<Card className="mb-8 shadow-xl bg-card/95 backdrop-blur-sm">
					<CardContent className="p-8">
						<div className="flex items-center justify-between mb-6">
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

							<div className="text-right">
								<div className="bg-muted rounded-xl p-4">
									<div className="text-2xl font-bold text-foreground">
										{votingProgress.completedElections} / {votingProgress.totalElections}
									</div>
									<div className="text-sm text-muted-foreground">Elections Completed</div>
								</div>
							</div>
						</div>

						<div className="text-center">
							<h1 className="text-4xl font-bold text-foreground mb-2">Available Elections</h1>
							<p className="text-muted-foreground">Select an election to view candidates and cast your vote</p>
						</div>

						{/* Progress Bar */}
						<div className="mt-6">
							<div className="flex justify-between text-sm text-muted-foreground mb-2">
								<span>Progress</span>
								<span>{Math.round((votingProgress.completedElections / votingProgress.totalElections) * 100)}%</span>
							</div>
							<div className="w-full bg-muted rounded-full h-3">
								<div
									className="bg-primary h-3 rounded-full transition-all duration-300"
									style={{ width: `${(votingProgress.completedElections / votingProgress.totalElections) * 100}%` }}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Available Elections */}
				{availableElections.length > 0 && (
					<Card className="mb-8 shadow-xl bg-card/95 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
								<Vote className="w-8 h-8 text-primary" />
								Available Elections ({availableElections.length})
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{availableElections.map((election) => (
								<div
									key={election.id}
									className="group p-6 border-2 border-border rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 hover:border-primary hover:shadow-xl bg-card hover:bg-muted/50"
									onClick={() => onElectionSelect(election)}
								>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
												{election.title}
											</h3>
											<Badge variant="secondary" className="mb-2">
												{election.category}
											</Badge>
											{election.description && <p className="text-muted-foreground mb-3">{election.description}</p>}
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Users className="w-4 h-4" />
												<span>{election.candidates?.length || 0} candidates</span>
											</div>
										</div>

										<div className="flex items-center gap-3">
											<div className="text-center">
												<div className="text-primary font-medium text-sm">Click to vote</div>
											</div>
											<ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
										</div>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* Completed Elections */}
				{completedElections.length > 0 && (
					<Card className="shadow-xl bg-card/95 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="text-2xl font-bold text-muted-foreground flex items-center gap-3">
								<CheckCircle className="w-8 h-8 text-muted-foreground" />
								Completed Elections ({completedElections.length})
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{completedElections.map((election) => (
								<div key={election.id} className="p-6 border-2 border-border rounded-2xl bg-muted/50">
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<h3 className="text-xl font-bold text-muted-foreground mb-2">{election.title}</h3>
											<Badge variant="secondary" className="mb-2">
												{election.category}
											</Badge>
										</div>

										<div className="flex items-center gap-3">
											<Badge className="bg-primary/10 text-primary">
												<CheckCircle className="w-4 h-4 mr-2" />
												Voted
											</Badge>
										</div>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
