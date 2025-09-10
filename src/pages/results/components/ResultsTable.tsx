import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Trophy, Medal, Award, Vote, Users } from "lucide-react";
import { memo } from "react";

interface Candidate {
	id: string;
	name: string;
	vote_count: number;
	profile_image_url?: string;
	position: number;
}

interface ElectionResult {
	id: string;
	title: string;
	category: string;
	status: string;
	total_votes: number;
	candidates: Candidate[];
	end_date: string;
}

interface ResultsTableProps {
	election: ElectionResult;
}

export const ResultsTable = memo(function ResultsTable({ election }: ResultsTableProps) {
	const sortedCandidates = [...election.candidates].sort((a, b) => b.vote_count - a.vote_count);
	const totalVotes = election.total_votes || 0;
	const maxVotes = sortedCandidates[0]?.vote_count || 0;
	const leaders = sortedCandidates.filter((c) => c.vote_count === maxVotes && maxVotes > 0);
	const isDraw = leaders.length > 1 && maxVotes > 0;

	const getRankIcon = (index: number) => {
		switch (index) {
			case 0:
				return <Trophy className="w-5 h-5 text-yellow-500" />;
			case 1:
				return <Medal className="w-5 h-5 text-gray-400" />;
			case 2:
				return <Award className="w-5 h-5 text-amber-600" />;
			default:
				return (
					<div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
						{index + 1}
					</div>
				);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 border-green-200";
			case "completed":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "draft":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Vote className="w-5 h-5 text-primary" />
						{election.title}
					</CardTitle>
					<div className="flex items-center gap-3">
						<Badge className={getStatusColor(election.status)}>{election.status.toUpperCase()}</Badge>
						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<Users className="w-4 h-4" />
							<span>{totalVotes} votes</span>
						</div>
					</div>
				</div>
				{election.category && (
					<Badge variant="outline" className="w-fit">
						{election.category}
					</Badge>
				)}
			</CardHeader>

			<CardContent>
				{isDraw && (
					<div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
							<span className="font-semibold text-amber-700 dark:text-amber-300">
								Draw - {leaders.length} candidates tied with {maxVotes} votes each
							</span>
						</div>
					</div>
				)}

				<div className="space-y-3">
					{sortedCandidates.map((candidate, index) => {
						const percentage = totalVotes > 0 ? (candidate.vote_count / totalVotes) * 100 : 0;
						const isLeader = isDraw ? leaders.includes(candidate) : index === 0;

						return (
							<div
								key={candidate.id}
								className={`flex items-center gap-4 p-4 rounded-lg border ${
									isLeader ? "bg-primary/5 border-primary/20" : "bg-card border-border"
								}`}
							>
								{/* Rank */}
								<div className="flex-shrink-0">{getRankIcon(index)}</div>

								{/* Candidate Info */}
								<div className="flex items-center gap-3 flex-1">
									<Avatar className="h-12 w-12">
										<AvatarImage src={candidate.profile_image_url} />
										<AvatarFallback className="bg-primary/10 text-primary font-semibold">
											{candidate.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<h4 className="font-semibold text-foreground truncate">{candidate.name}</h4>
										<div className="flex items-center gap-2 mt-1">
											<Progress value={percentage} className="h-2 flex-1" />
											<span className="text-sm text-muted-foreground min-w-[45px] text-right">
												{Math.round(percentage)}%
											</span>
										</div>
									</div>
								</div>

								{/* Vote Count */}
								<div className="text-right flex-shrink-0">
									<div className={`text-xl font-bold ${isLeader ? "text-primary" : "text-foreground"}`}>
										{candidate.vote_count}
									</div>
									<div className="text-xs text-muted-foreground">{candidate.vote_count === 1 ? "vote" : "votes"}</div>
								</div>
							</div>
						);
					})}
				</div>

				{sortedCandidates.length === 0 && (
					<div className="text-center py-8 text-muted-foreground">
						<Vote className="w-12 h-12 mx-auto mb-3 opacity-50" />
						<p className="font-medium">No candidates found</p>
						<p className="text-sm">Add candidates to see results</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
});
