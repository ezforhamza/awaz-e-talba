import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { MoreVertical, Edit, Trash2, Search, Plus, Users, Hash } from "lucide-react";
import { toast } from "sonner";

interface Candidate {
	id: string;
	name: string;
	description?: string;
	profile_image_url?: string;
	election_symbol_url?: string;
	position: number;
	election_id?: string;
}

interface CandidateListProps {
	candidates: Candidate[];
	onEdit: (candidate: Candidate) => void;
	onDelete: (id: string) => Promise<void>;
	onAdd: () => void;
	isLoading?: boolean;
	isDeleting?: boolean;
	electionTitle?: string;
}

export function CandidateList({
	candidates,
	onEdit,
	onDelete,
	onAdd,
	isLoading = false,
	isDeleting = false,
	electionTitle,
}: CandidateListProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [deleteDialog, setDeleteDialog] = useState<{
		open: boolean;
		candidate: Candidate | null;
	}>({ open: false, candidate: null });

	const filteredCandidates = candidates.filter(
		(candidate) =>
			candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			candidate.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			false,
	);

	const sortedCandidates = [...filteredCandidates].sort((a, b) => a.position - b.position);

	const handleDelete = async () => {
		if (!deleteDialog.candidate) return;

		const candidatePosition = deleteDialog.candidate.position;
		const candidateName = deleteDialog.candidate.name;
		const loadingToast = toast.loading(`Deleting candidate "${candidateName}"...`);

		try {
			await onDelete(deleteDialog.candidate.id);
			setDeleteDialog({ open: false, candidate: null });

			// Check if this was the earliest position and show appropriate message
			const wasEarliestPosition = candidates.some((c) => c.position < candidatePosition) === false;

			if (wasEarliestPosition && candidates.length > 1) {
				toast.success(
					`✅ Candidate "${candidateName}" deleted successfully! Other candidate positions have been automatically adjusted.`,
					{ id: loadingToast, duration: 4000 },
				);
			} else {
				toast.success(`✅ Candidate "${candidateName}" deleted successfully!`, { id: loadingToast });
			}
		} catch (error) {
			console.error("Failed to delete candidate:", error);
			toast.error(`❌ Failed to delete candidate: ${error instanceof Error ? error.message : "Unknown error"}`, {
				id: loadingToast,
			});
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Candidates</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex items-center space-x-4 animate-pulse">
								<div className="h-12 w-12 bg-gray-200 rounded-full"></div>
								<div className="space-y-2 flex-1">
									<div className="h-4 bg-gray-200 rounded w-3/4"></div>
									<div className="h-3 bg-gray-200 rounded w-1/2"></div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold flex items-center gap-2">
						<Hash className="h-6 w-6 text-primary" />
						Candidates
						{candidates.length > 0 && (
							<Badge variant="outline" className="ml-2">
								{candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
							</Badge>
						)}
					</h2>
					{electionTitle && (
						<p className="text-muted-foreground mt-1">
							Managing candidates for <span className="font-medium">{electionTitle}</span>
						</p>
					)}
				</div>
				<Button onClick={onAdd} className="h-11 px-6 font-semibold">
					<Plus className="w-4 h-4 mr-2" />
					Add Candidate
				</Button>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search candidates..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-10 h-11"
				/>
			</div>

			{/* Candidates Grid */}
			{sortedCandidates.length === 0 ? (
				<div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-muted/30">
					<div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<Users className="h-8 w-8 text-primary" />
					</div>
					<h3 className="text-lg font-semibold mb-2">{searchTerm ? "No candidates found" : "No candidates yet"}</h3>
					<p className="text-muted-foreground mb-6">
						{searchTerm ? "Try adjusting your search terms" : "Add your first candidate to get started"}
					</p>
					{!searchTerm && (
						<Button onClick={onAdd} className="h-11 px-6">
							<Plus className="w-4 h-4 mr-2" />
							Add First Candidate
						</Button>
					)}
				</div>
			) : (
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{sortedCandidates.map((candidate) => (
						<Card
							key={candidate.id}
							className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden"
						>
							{/* Action Menu */}
							<div className="absolute top-4 right-4 z-10">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm">
											<MoreVertical className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => onEdit(candidate)}>
											<Edit className="w-4 h-4 mr-2" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => setDeleteDialog({ open: true, candidate })}
											className="text-destructive"
											disabled={isDeleting}
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							<CardContent className="p-0">
								{/* Profile Section */}
								<div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-8 text-center">
									<Avatar className="h-32 w-32 ring-4 ring-background shadow-xl mx-auto mb-4">
										<AvatarImage
											src={candidate.profile_image_url || undefined}
											alt={candidate.name}
											className="object-cover"
										/>
										<AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
											{candidate.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.slice(0, 2)
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>

									<h3 className="font-bold text-xl mb-2 text-foreground">{candidate.name}</h3>
									<Badge variant="secondary" className="text-sm font-semibold px-4 py-2 bg-primary/10">
										Position #{candidate.position}
									</Badge>
								</div>

								{/* Description */}
								{candidate.description && (
									<div className="p-6 pb-4">
										<p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed text-center">
											{candidate.description}
										</p>
									</div>
								)}

								{/* Election Symbol - Much Bigger */}
								{candidate.election_symbol_url && (
									<div className="p-6 pt-2">
										<div className="bg-muted/40 rounded-2xl p-6 text-center">
											<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
												Election Symbol
											</p>
											<div className="bg-background rounded-xl p-6 shadow-sm border-2 border-border/50">
												<img
													src={candidate.election_symbol_url}
													alt={`${candidate.name}'s election symbol`}
													className="h-32 w-32 mx-auto object-contain drop-shadow-sm"
												/>
											</div>
										</div>
									</div>
								)}

								{/* No symbol placeholder */}
								{!candidate.election_symbol_url && (
									<div className="p-6 pt-2">
										<div className="bg-muted/20 rounded-2xl p-6 text-center border-2 border-dashed border-muted-foreground/20">
											<Hash className="h-12 w-12 mx-auto text-muted-foreground/40 mb-2" />
											<p className="text-xs text-muted-foreground">No election symbol</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Delete Confirmation */}
			<Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, candidate: null })}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Candidate</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deleteDialog.candidate?.name}"? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialog({ open: false, candidate: null })}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
							{isDeleting ? "Deleting..." : "Delete Candidate"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
