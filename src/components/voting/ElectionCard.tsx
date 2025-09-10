import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Clock, Users, CheckCircle } from "lucide-react";

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
	description?: string;
	category: string;
	candidates?: Candidate[];
	hasVoted: boolean;
}

interface ElectionCardProps {
	election: Election;
	onVote: (electionId: string) => void;
	onViewCandidates: (electionId: string) => void;
	isVoting?: boolean;
}

export function ElectionCard({ election, onVote, onViewCandidates, isVoting = false }: ElectionCardProps) {
	const candidateCount = election.candidates?.length || 0;
	const topCandidates = election.candidates?.slice(0, 3) || [];

	return (
		<Card className={`transition-all hover:shadow-md ${election.hasVoted ? "bg-green-50 border-green-200" : ""}`}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<CardTitle className="text-lg">{election.title}</CardTitle>
						<CardDescription>{election.description}</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="secondary">{election.category}</Badge>
						{election.hasVoted && (
							<Badge variant="default" className="bg-green-600">
								<CheckCircle className="w-3 h-3 mr-1" />
								Voted
							</Badge>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div className="space-y-4">
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Users className="w-4 h-4" />
							<span>{candidateCount} candidates</span>
						</div>
						<div className="flex items-center gap-1">
							<Clock className="w-4 h-4" />
							<span>Active now</span>
						</div>
					</div>

					{topCandidates.length > 0 && (
						<div className="space-y-2">
							<p className="text-sm font-medium">Candidates:</p>
							<div className="flex items-center gap-2">
								{topCandidates.map((candidate) => (
									<div key={candidate.id} className="flex items-center gap-2">
										<Avatar className="h-6 w-6">
											<AvatarImage src={candidate.profile_image_url} alt={candidate.name} />
											<AvatarFallback className="text-xs">
												{candidate.name
													.split(" ")
													.map((n) => n[0])
													.join("")
													.slice(0, 2)}
											</AvatarFallback>
										</Avatar>
										<span className="text-xs text-muted-foreground truncate">{candidate.name}</span>
									</div>
								))}
								{candidateCount > 3 && (
									<span className="text-xs text-muted-foreground">+{candidateCount - 3} more</span>
								)}
							</div>
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter className="flex gap-2">
				<Button variant="outline" onClick={() => onViewCandidates(election.id)} className="flex-1">
					View Candidates
				</Button>
				<Button onClick={() => onVote(election.id)} disabled={election.hasVoted || isVoting} className="flex-1">
					{election.hasVoted ? "Already Voted" : isVoting ? "Voting..." : "Vote Now"}
				</Button>
			</CardFooter>
		</Card>
	);
}
