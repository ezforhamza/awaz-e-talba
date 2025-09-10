import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { ResultsTable } from "./components/ResultsTable";
import { VotersTable } from "./components/VotersTable";
import { useResultsData } from "./hooks/useResultsData";
import { BarChart3, Users, Activity, Vote, Download, FileText, FileSpreadsheet, FileImage } from "lucide-react";
import {
	exportElectionResultsToCSV,
	exportVotingActivityToCSV,
	exportElectionResultsToJSON,
	exportVotingActivityToJSON,
	exportElectionResultsToHTML,
	exportVotingActivityToHTML,
} from "@/utils/exportUtils";

export default function ResultsPage() {
	const { elections, votes, loading, error } = useResultsData();
	const [selectedElection, setSelectedElection] = useState<string | null>(null);

	// Get votes for selected election or all votes
	const filteredVotes = selectedElection ? votes.filter((vote) => vote.election.id === selectedElection) : votes;

	const selectedElectionData = selectedElection ? elections.find((e) => e.id === selectedElection) : null;

	const activeElections = elections.filter((e) => e.status === "active");
	const completedElections = elections.filter((e) => e.status === "completed");
	const totalVotes = elections.reduce((sum, e) => sum + e.total_votes, 0);

	if (error) {
		return (
			<div className="min-h-screen bg-background p-6">
				<div className="container mx-auto">
					<Card>
						<CardContent className="p-12 text-center">
							<div className="text-red-500 mb-4">
								<Activity className="w-16 h-16 mx-auto mb-4" />
							</div>
							<h3 className="text-lg font-semibold mb-2">Error Loading Results</h3>
							<p className="text-muted-foreground">{error}</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="container mx-auto space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold text-foreground">Results</h1>
						<p className="mt-2 text-muted-foreground">Live election results and voting activity</p>
					</div>

					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
							<span className="text-sm font-medium text-green-600">Live Updates</span>
						</div>

						{/* Export Buttons */}
						<div className="flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="flex items-center gap-2">
										<Download className="w-4 h-4" />
										Export Results
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => exportElectionResultsToCSV(elections)}>
										<FileSpreadsheet className="w-4 h-4 mr-2" />
										Export as CSV
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => exportElectionResultsToJSON(elections)}>
										<FileText className="w-4 h-4 mr-2" />
										Export as JSON
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => exportElectionResultsToHTML(elections)}>
										<FileImage className="w-4 h-4 mr-2" />
										Export as HTML Report
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="flex items-center gap-2">
										<Download className="w-4 h-4" />
										Export Activity
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => exportVotingActivityToCSV(filteredVotes)}>
										<FileSpreadsheet className="w-4 h-4 mr-2" />
										Export as CSV
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => exportVotingActivityToJSON(filteredVotes)}>
										<FileText className="w-4 h-4 mr-2" />
										Export as JSON
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => exportVotingActivityToHTML(filteredVotes)}>
										<FileImage className="w-4 h-4 mr-2" />
										Export as HTML Report
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Total Elections</p>
									<p className="text-3xl font-bold text-foreground">{elections.length}</p>
								</div>
								<BarChart3 className="w-8 h-8 text-primary" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Active Elections</p>
									<p className="text-3xl font-bold text-foreground">{activeElections.length}</p>
								</div>
								<Vote className="w-8 h-8 text-green-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Total Votes</p>
									<p className="text-3xl font-bold text-foreground">{totalVotes}</p>
								</div>
								<Users className="w-8 h-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Completed</p>
									<p className="text-3xl font-bold text-foreground">{completedElections.length}</p>
								</div>
								<Activity className="w-8 h-8 text-purple-600" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<Tabs defaultValue="results" className="space-y-6">
					<TabsList className="grid w-full max-w-2xl grid-cols-3">
						<TabsTrigger value="results" className="flex items-center gap-2">
							<BarChart3 className="w-4 h-4" />
							Election Results
						</TabsTrigger>
						<TabsTrigger value="activity" className="flex items-center gap-2">
							<Activity className="w-4 h-4" />
							Voting Activity
						</TabsTrigger>
						<TabsTrigger value="voters" className="flex items-center gap-2">
							<Users className="w-4 h-4" />
							Voter List
						</TabsTrigger>
					</TabsList>

					<TabsContent value="results" className="space-y-6">
						{/* Election Filter */}
						{elections.length > 1 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Filter by Election</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										<Badge
											variant={selectedElection === null ? "default" : "outline"}
											className="cursor-pointer"
											onClick={() => setSelectedElection(null)}
										>
											All Elections
										</Badge>
										{elections.map((election) => (
											<Badge
												key={election.id}
												variant={selectedElection === election.id ? "default" : "outline"}
												className="cursor-pointer"
												onClick={() => setSelectedElection(election.id)}
											>
												{election.title}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Results Tables */}
						{loading ? (
							<div className="space-y-6">
								{[...Array(2)].map((_, i) => (
									<div key={i} className="h-96 bg-muted animate-pulse rounded-lg"></div>
								))}
							</div>
						) : (
							<div className="space-y-6">
								{(selectedElection ? [selectedElectionData!] : elections).map(
									(election) => election && <ResultsTable key={election.id} election={election} />,
								)}
							</div>
						)}
					</TabsContent>

					<TabsContent value="activity" className="space-y-6">
						<VotersTable votes={filteredVotes} electionTitle={selectedElectionData?.title} loading={loading} />
					</TabsContent>

					<TabsContent value="voters" className="space-y-6">
						{/* Election Filter for Voter List */}
						{elections.length > 1 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Filter by Election</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										<Badge
											variant={selectedElection === null ? "default" : "outline"}
											className="cursor-pointer"
											onClick={() => setSelectedElection(null)}
										>
											All Elections
										</Badge>
										{elections.map((election) => (
											<Badge
												key={election.id}
												variant={selectedElection === election.id ? "default" : "outline"}
												className="cursor-pointer"
												onClick={() => setSelectedElection(election.id)}
											>
												{election.title}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Voter List by Election */}
						{loading ? (
							<div className="h-96 bg-muted animate-pulse rounded-lg"></div>
						) : (
							<div className="space-y-6">
								{(selectedElection ? [selectedElectionData!] : elections).filter(Boolean).map((election) => {
									const electionVotes = votes.filter((vote) => vote.election.id === election.id);

									if (electionVotes.length === 0) return null;

									return (
										<Card key={election.id}>
											<CardHeader>
												<div className="flex items-center justify-between">
													<div>
														<CardTitle className="text-xl">{election.title}</CardTitle>
														<p className="text-sm text-muted-foreground mt-1">
															Category: {election.category} • {electionVotes.length} votes cast
														</p>
													</div>
													<Badge variant={election.status === "active" ? "default" : "secondary"}>
														{election.status}
													</Badge>
												</div>
											</CardHeader>
											<CardContent>
												<div className="overflow-x-auto">
													<table className="w-full">
														<thead>
															<tr className="border-b">
																<th className="text-left py-2 px-4 font-medium text-sm text-muted-foreground">Voter</th>
																<th className="text-left py-2 px-4 font-medium text-sm text-muted-foreground">
																	Voted For
																</th>
																<th className="text-left py-2 px-4 font-medium text-sm text-muted-foreground">
																	Vote Time
																</th>
															</tr>
														</thead>
														<tbody>
															{electionVotes
																.sort((a, b) => new Date(b.voted_at).getTime() - new Date(a.voted_at).getTime())
																.map((vote, index) => (
																	<tr key={vote.id} className="border-b hover:bg-muted/50">
																		<td className="py-3 px-4">
																			<div className="flex items-center gap-3">
																				<div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-200">
																					<span className="text-xs font-bold text-blue-600">
																						{vote.voter.name
																							.split(" ")
																							.map((n) => n.charAt(0))
																							.join("")}
																					</span>
																				</div>
																				<div>
																					<div className="font-semibold text-foreground">{vote.voter.name}</div>
																					<div className="text-xs text-muted-foreground">{vote.voter.roll_number}</div>
																				</div>
																			</div>
																		</td>
																		<td className="py-3 px-4">
																			<div className="flex items-center gap-3">
																				{vote.candidate.profile_image_url ? (
																					<img
																						src={vote.candidate.profile_image_url}
																						alt={vote.candidate.name}
																						className="w-8 h-8 rounded-full object-cover"
																					/>
																				) : (
																					<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
																						<span className="text-xs font-medium">{vote.candidate.name.charAt(0)}</span>
																					</div>
																				)}
																				<span className="font-medium">{vote.candidate.name}</span>
																			</div>
																		</td>
																		<td className="py-3 px-4 text-sm text-muted-foreground">
																			{new Date(vote.voted_at).toLocaleString()}
																		</td>
																	</tr>
																))}
														</tbody>
													</table>
												</div>

												{electionVotes.length === 0 && (
													<div className="text-center py-12">
														<Vote className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
														<p className="text-muted-foreground">No votes cast yet</p>
													</div>
												)}
											</CardContent>
										</Card>
									);
								})}

								{elections.length === 0 && (
									<Card>
										<CardContent className="p-12 text-center">
											<BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
											<h3 className="text-lg font-semibold mb-2">No Elections Found</h3>
											<p className="text-muted-foreground">Create elections to see voter activity here</p>
										</CardContent>
									</Card>
								)}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
