import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Badge } from "@/ui/badge";
import { CheckCircle, Clock, Vote } from "lucide-react";

interface VotingProgressProps {
	totalElections: number;
	completedElections: number;
	currentElection?: string;
	studentName?: string;
}

export function VotingProgress({
	totalElections,
	completedElections,
	currentElection,
	studentName,
}: VotingProgressProps) {
	const progressPercentage = totalElections > 0 ? Math.round((completedElections / totalElections) * 100) : 0;

	const isComplete = completedElections === totalElections;
	const remainingElections = totalElections - completedElections;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg">Voting Progress</CardTitle>
						{studentName && <CardDescription>Welcome, {studentName}</CardDescription>}
					</div>
					<div className="flex items-center gap-2">
						{isComplete ? (
							<Badge variant="default" className="bg-green-600">
								<CheckCircle className="w-3 h-3 mr-1" />
								Complete
							</Badge>
						) : (
							<Badge variant="secondary">
								<Clock className="w-3 h-3 mr-1" />
								In Progress
							</Badge>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Elections completed</span>
						<span className="font-medium">
							{completedElections} of {totalElections}
						</span>
					</div>
					<Progress value={progressPercentage} className="h-2" />
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>{progressPercentage}% complete</span>
						{remainingElections > 0 && <span>{remainingElections} remaining</span>}
					</div>
				</div>

				{isComplete ? (
					<div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-800 border border-green-200">
						<CheckCircle className="w-5 h-5" />
						<div className="text-sm">
							<p className="font-medium">Voting Complete!</p>
							<p className="text-green-700">You have successfully voted in all active elections.</p>
						</div>
					</div>
				) : (
					<div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
						<Vote className="w-5 h-5" />
						<div className="text-sm">
							<p className="font-medium">Continue Voting</p>
							<p className="text-blue-700">
								{remainingElections === 1
									? "You have 1 election remaining."
									: `You have ${remainingElections} elections remaining.`}
							</p>
						</div>
					</div>
				)}

				{currentElection && (
					<div className="pt-2 border-t">
						<p className="text-xs text-muted-foreground">Current: {currentElection}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
