import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Alert, AlertDescription } from "@/ui/alert";
import { Trophy, Users, Activity, AlertTriangle } from "lucide-react";
import { useRealTimeResults } from "@/hooks/useRealTimeResults";

interface LiveResultsProps {
	adminId: string;
}

export function LiveResults({ adminId }: LiveResultsProps) {
	const { electionResults, isLoading, isConnected, error, getActiveResults, getFraudAlerts } =
		useRealTimeResults(adminId);

	const activeResults = getActiveResults();
	const fraudAlerts = getFraudAlerts();

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Live Results</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="animate-pulse space-y-2">
								<div className="h-4 bg-gray-200 rounded w-3/4"></div>
								<div className="h-2 bg-gray-200 rounded"></div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>Failed to load results: {error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			{/* Connection Status */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg">Live Results Dashboard</CardTitle>
						<Badge variant={isConnected ? "default" : "destructive"}>
							<Activity className="w-3 h-3 mr-1" />
							{isConnected ? "Live" : "Disconnected"}
						</Badge>
					</div>
				</CardHeader>
			</Card>

			{/* Fraud Alerts */}
			{fraudAlerts.length > 0 && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						{fraudAlerts.length} fraud attempt{fraudAlerts.length > 1 ? "s" : ""} detected in the last 24 hours.
					</AlertDescription>
				</Alert>
			)}

			{/* Active Elections */}
			{activeResults.length === 0 ? (
				<Card>
					<CardContent className="pt-6">
						<div className="text-center py-8">
							<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500">No active elections at the moment</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6">
					{activeResults.map((election) => (
						<Card key={election.election_id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>{election.election_title}</CardTitle>
										<CardDescription>{election.election_category}</CardDescription>
									</div>
									<div className="text-right">
										<Badge variant="secondary">
											<Users className="w-3 h-3 mr-1" />
											{election.total_votes} votes
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{election.candidates
										.sort((a, b) => b.vote_count - a.vote_count)
										.map((candidate, index) => (
											<div key={candidate.candidate_id} className="space-y-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														{index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
														<Avatar className="h-8 w-8">
															<AvatarImage src={candidate.profile_image_url} alt={candidate.candidate_name} />
															<AvatarFallback className="text-xs">
																{candidate.candidate_name
																	.split(" ")
																	.map((n) => n[0])
																	.join("")
																	.slice(0, 2)}
															</AvatarFallback>
														</Avatar>
														<div>
															<p className="font-medium text-sm">{candidate.candidate_name}</p>
															<p className="text-xs text-muted-foreground">Position {candidate.position}</p>
														</div>
													</div>
													<div className="text-right">
														<p className="font-bold">{candidate.vote_percentage}%</p>
														<p className="text-xs text-muted-foreground">{candidate.vote_count} votes</p>
													</div>
												</div>
												<Progress value={candidate.vote_percentage} className="h-2" />
											</div>
										))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
