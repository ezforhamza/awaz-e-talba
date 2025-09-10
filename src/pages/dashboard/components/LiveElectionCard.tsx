import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Vote, Users, Clock, MoreVertical, Trash2, Edit, Play, Square, CheckCircle } from "lucide-react";
import { useElections } from "@/hooks/elections";

interface Candidate {
	id: string;
	name: string;
	vote_count: number;
	profile_image_url?: string;
}

interface Election {
	id: string;
	title: string;
	category: string;
	total_votes: number;
	candidates: Candidate[];
	end_date: string;
	status: string;
	description?: string;
}

interface LiveElectionCardProps {
	election: Election;
	showAdminActions?: boolean;
	onEdit?: (electionId: string) => void;
}

export function LiveElectionCard({ election, showAdminActions = false, onEdit }: LiveElectionCardProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const { deleteElection, changeElectionStatus, isDeleting, isChangingStatus } = useElections();

	const totalVotes = election.total_votes || 0;
	const sortedCandidates = [...election.candidates].sort((a, b) => b.vote_count - a.vote_count);

	// Handle draw cases - find all candidates with the highest vote count
	const maxVotes = sortedCandidates[0]?.vote_count || 0;
	const leaders = sortedCandidates.filter((candidate) => candidate.vote_count === maxVotes && maxVotes > 0);
	const isDraw = leaders.length > 1 && maxVotes > 0;

	const timeRemaining = new Date(election.end_date).getTime() - new Date().getTime();
	const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

	const handleDelete = async () => {
		try {
			await deleteElection(election.id);
			setShowDeleteDialog(false);
		} catch (error) {
			console.error("Failed to delete election:", error);
		}
	};

	const handleStatusChange = async (newStatus: string) => {
		try {
			await changeElectionStatus({ id: election.id, status: newStatus });
		} catch (error) {
			console.error("Failed to change status:", error);
		}
	};

	const canActivate = () => {
		return election.status === "draft" && election.candidates.length >= 2;
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg font-semibold flex items-center gap-2">
						<Vote className="w-5 h-5 text-primary" />
						{election.title}
					</CardTitle>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="text-xs">
							{election.category}
						</Badge>
						{showAdminActions && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm">
										<MoreVertical className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{onEdit && (
										<DropdownMenuItem onClick={() => onEdit(election.id)}>
											<Edit className="w-4 h-4 mr-2" />
											Edit
										</DropdownMenuItem>
									)}

									{election.status === "draft" && canActivate() && (
										<DropdownMenuItem onClick={() => handleStatusChange("active")} disabled={isChangingStatus}>
											<Play className="w-4 h-4 mr-2" />
											Activate
										</DropdownMenuItem>
									)}

									{election.status === "active" && (
										<DropdownMenuItem onClick={() => handleStatusChange("completed")} disabled={isChangingStatus}>
											<Square className="w-4 h-4 mr-2" />
											Complete
										</DropdownMenuItem>
									)}

									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => setShowDeleteDialog(true)}
										disabled={isDeleting}
										className="text-destructive"
									>
										<Trash2 className="w-4 h-4 mr-2" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-1">
						<Users className="w-4 h-4" />
						<span>{totalVotes} votes</span>
					</div>
					<div className="flex items-center gap-1">
						<Clock className="w-4 h-4" />
						<span>{hoursRemaining}h remaining</span>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{sortedCandidates.length > 0 ? (
					<>
						{/* Draw Case or Leading Candidates */}
						{isDraw ? (
							<div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
								<div className="flex items-center gap-2 mb-3">
									<div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
									<p className="font-semibold text-amber-700 dark:text-amber-300">
										Draw - {leaders.length} candidates tied
									</p>
								</div>
								<div className="space-y-2">
									{leaders.map((leader) => (
										<div key={leader.id} className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarImage src={leader.profile_image_url} />
												<AvatarFallback className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-semibold text-sm">
													{leader.name.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<p className="font-medium text-foreground text-sm">{leader.name}</p>
											</div>
											<div className="text-right">
												<p className="font-bold text-amber-600 dark:text-amber-400">{leader.vote_count}</p>
												<p className="text-xs text-muted-foreground">
													{totalVotes > 0 ? Math.round((leader.vote_count / totalVotes) * 100) : 0}%
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							leaders.length > 0 && (
								<div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
									<div className="flex items-center gap-3 mb-3">
										<Avatar className="h-10 w-10">
											<AvatarImage src={leaders[0].profile_image_url} />
											<AvatarFallback className="bg-primary/10 text-primary font-semibold">
												{leaders[0].name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<p className="font-semibold text-foreground">{leaders[0].name}</p>
											<p className="text-sm text-muted-foreground">Leading candidate</p>
										</div>
										<div className="text-right">
											<p className="font-bold text-primary">{leaders[0].vote_count}</p>
											<p className="text-xs text-muted-foreground">
												{totalVotes > 0 ? Math.round((leaders[0].vote_count / totalVotes) * 100) : 0}%
											</p>
										</div>
									</div>
									<Progress value={totalVotes > 0 ? (leaders[0].vote_count / totalVotes) * 100 : 0} className="h-2" />
								</div>
							)
						)}

						{/* Other Candidates */}
						{sortedCandidates
							.filter((candidate) => (isDraw ? !leaders.includes(candidate) : candidate.vote_count !== maxVotes))
							.map((candidate) => (
								<div
									key={candidate.id}
									className="flex items-center gap-3 py-3 border-b border-border/50 last:border-b-0"
								>
									<Avatar className="h-9 w-9">
										<AvatarImage src={candidate.profile_image_url} />
										<AvatarFallback className="bg-muted font-medium text-sm">{candidate.name.charAt(0)}</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm text-foreground truncate">{candidate.name}</p>
										<div className="flex items-center gap-2 mt-1">
											<Progress
												value={totalVotes > 0 ? (candidate.vote_count / totalVotes) * 100 : 0}
												className="h-1.5 flex-1"
											/>
											<span className="text-xs text-muted-foreground min-w-[35px] text-right">
												{totalVotes > 0 ? Math.round((candidate.vote_count / totalVotes) * 100) : 0}%
											</span>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-sm">{candidate.vote_count}</p>
									</div>
								</div>
							))}
					</>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<Vote className="w-12 h-12 mx-auto mb-3 opacity-50" />
						<p>No votes cast yet</p>
						<p className="text-sm">Results will appear here as votes come in</p>
					</div>
				)}
			</CardContent>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Election</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{election.title}"? This action cannot be undone and will remove all
							voting data associated with this election.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
							{isDeleting ? "Deleting..." : "Delete Election"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
