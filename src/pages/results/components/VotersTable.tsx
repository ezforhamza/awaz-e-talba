import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Eye, EyeOff, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, memo } from "react";
import { Button } from "@/ui/button";

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

interface VotersTableProps {
	votes: VoteRecord[];
	electionTitle?: string;
	loading?: boolean;
}

export const VotersTable = memo(function VotersTable({ votes, electionTitle, loading }: VotersTableProps) {
	const [showDetails, setShowDetails] = useState(false);

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="w-5 h-5" />
						Voting Activity {electionTitle && `- ${electionTitle}`}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="flex items-center gap-3 p-3 animate-pulse">
								<div className="w-10 h-10 bg-muted rounded-full"></div>
								<div className="flex-1 space-y-1">
									<div className="h-4 bg-muted rounded w-1/3"></div>
									<div className="h-3 bg-muted rounded w-1/2"></div>
								</div>
								<div className="h-4 bg-muted rounded w-20"></div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Users className="w-5 h-5" />
						Voting Activity {electionTitle && `- ${electionTitle}`}
					</CardTitle>
					<div className="flex items-center gap-3">
						<Badge variant="outline" className="text-xs">
							{votes.length} votes
						</Badge>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowDetails(!showDetails)}
							className="flex items-center gap-2"
						>
							{showDetails ? (
								<>
									<EyeOff className="w-4 h-4" />
									Hide Details
								</>
							) : (
								<>
									<Eye className="w-4 h-4" />
									Show Details
								</>
							)}
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{votes.length > 0 ? (
					<div className="space-y-2">
						{votes.map((vote) => (
							<div
								key={vote.id}
								className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
							>
								{/* Voter Information */}
								<div className="flex-shrink-0">
									<div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-200">
										<span className="text-xs font-bold text-blue-600">
											{vote.voter.name
												.split(" ")
												.map((n) => n.charAt(0))
												.join("")}
										</span>
									</div>
								</div>

								{/* Vote Details */}
								<div className="flex-1 min-w-0">
									<div className="mb-1">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-foreground">{vote.voter.name}</span>
											<Badge variant="outline" className="text-xs">
												{vote.voter.roll_number}
											</Badge>
										</div>
									</div>

									{showDetails ? (
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<span className="text-sm text-muted-foreground">Voted for:</span>
												<div className="flex items-center gap-2">
													<Avatar className="h-5 w-5">
														<AvatarImage src={vote.candidate.profile_image_url} />
														<AvatarFallback className="bg-green-50 text-green-600 text-xs font-semibold">
															{vote.candidate.name.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<span className="font-medium text-green-600">{vote.candidate.name}</span>
												</div>
											</div>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Badge variant="secondary" className="text-xs">
													{vote.election.category}
												</Badge>
												<span>•</span>
												<span className="font-medium">{vote.election.title}</span>
											</div>
										</div>
									) : (
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">Voted in</span>
											<Badge variant="secondary" className="text-xs">
												{vote.election.category}
											</Badge>
											<span className="text-sm text-muted-foreground">•</span>
											<span className="text-sm font-medium text-foreground">{vote.election.title}</span>
										</div>
									)}
								</div>

								{/* Timestamp */}
								<div className="flex-shrink-0 text-right">
									<div className="flex items-center gap-1 text-xs text-muted-foreground">
										<Clock className="w-3 h-3" />
										<span>{formatDistanceToNow(new Date(vote.voted_at), { addSuffix: true })}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
						<p className="font-medium">No votes recorded</p>
						<p className="text-sm">Vote activity will appear here as users vote</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
});
