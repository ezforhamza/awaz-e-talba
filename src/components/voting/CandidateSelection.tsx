import { useState } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { ArrowLeft, Vote } from "lucide-react";
import { Label } from "@/ui/label";

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
	candidates: Candidate[];
}

interface CandidateSelectionProps {
	election: Election;
	onBack: () => void;
	onVote: (candidateId: string) => Promise<void>;
	isVoting?: boolean;
}

export function CandidateSelection({ election, onBack, onVote, isVoting = false }: CandidateSelectionProps) {
	const [selectedCandidate, setSelectedCandidate] = useState<string>("");

	const handleVote = async () => {
		if (selectedCandidate) {
			await onVote(selectedCandidate);
		}
	};

	const sortedCandidates = [...election.candidates].sort((a, b) => a.position - b.position);

	return (
		<div className="max-w-4xl mx-auto p-4 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={onBack}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Elections
				</Button>
				<div>
					<h1 className="text-2xl font-bold">{election.title}</h1>
					<p className="text-muted-foreground">Select one candidate to vote for</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Cast Your Vote</CardTitle>
							<CardDescription>Choose your preferred candidate for {election.category}</CardDescription>
						</div>
						<Badge variant="secondary">{election.category}</Badge>
					</div>
				</CardHeader>

				<CardContent>
					<RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
						<div className="grid gap-4 md:grid-cols-2">
							{sortedCandidates.map((candidate) => (
								<Label key={candidate.id} htmlFor={candidate.id} className="cursor-pointer">
									<div
										className={`
                    flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent transition-colors
                    ${selectedCandidate === candidate.id ? "border-primary bg-primary/5" : ""}
                  `}
									>
										<RadioGroupItem value={candidate.id} id={candidate.id} />

										<div className="flex items-center gap-4 flex-1">
											<Avatar className="h-12 w-12">
												<AvatarImage src={candidate.profile_image_url} alt={candidate.name} />
												<AvatarFallback>
													{candidate.name
														.split(" ")
														.map((n) => n[0])
														.join("")
														.slice(0, 2)}
												</AvatarFallback>
											</Avatar>

											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">{candidate.name}</p>
												{candidate.description && (
													<p className="text-sm text-muted-foreground line-clamp-2">{candidate.description}</p>
												)}
												<div className="flex items-center gap-2 mt-1">
													<Badge variant="outline" className="text-xs">
														Position {candidate.position}
													</Badge>
												</div>
											</div>

											{candidate.election_symbol_url && (
												<img
													src={candidate.election_symbol_url}
													alt="Election symbol"
													className="h-8 w-8 object-contain"
												/>
											)}
										</div>
									</div>
								</Label>
							))}
						</div>
					</RadioGroup>
				</CardContent>

				<CardFooter className="flex justify-between">
					<p className="text-sm text-muted-foreground">
						{selectedCandidate ? "Candidate selected" : "Please select a candidate"}
					</p>
					<Button onClick={handleVote} disabled={!selectedCandidate || isVoting} className="min-w-[120px]">
						{isVoting ? (
							"Casting Vote..."
						) : (
							<>
								<Vote className="w-4 h-4 mr-2" />
								Cast Vote
							</>
						)}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
