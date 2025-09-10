import { useState } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/ui/alert";
import {
	Calendar,
	Users,
	MoreVertical,
	Play,
	Square,
	Edit,
	Trash2,
	Plus,
	Clock,
	CheckCircle,
	Archive,
} from "lucide-react";
import { useElections } from "@/hooks/elections";
import { format } from "date-fns";

interface ElectionManagementProps {
	onCreateNew: () => void;
	onEdit: (electionId: string) => void;
}

export function ElectionManagement({ onCreateNew, onEdit }: ElectionManagementProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; election: any | null }>({
		open: false,
		election: null,
	});

	const {
		elections,
		stats,
		isLoading,
		deleteElection,
		changeElectionStatus,
		isDeleting,
		isChangingStatus,
		deleteError,
		statusError,
		isElectionActive,
	} = useElections();

	const filteredElections = elections.filter((election) => {
		const matchesSearch =
			election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			election.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			false;
		const matchesStatus = statusFilter === "all" || election.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "draft":
				return "secondary";
			case "active":
				return "default";
			case "completed":
				return "outline";
			case "archived":
				return "destructive";
			default:
				return "secondary";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "draft":
				return <Edit className="w-3 h-3" />;
			case "active":
				return <Play className="w-3 h-3" />;
			case "completed":
				return <CheckCircle className="w-3 h-3" />;
			case "archived":
				return <Archive className="w-3 h-3" />;
			default:
				return <Clock className="w-3 h-3" />;
		}
	};

	const canActivate = (election: any) => {
		return election.status === "draft" && election.candidates && election.candidates.length >= 2;
	};

	const handleStatusChange = async (electionId: string, newStatus: any) => {
		try {
			await changeElectionStatus({ id: electionId, status: newStatus });
		} catch (error) {
			console.error("Failed to change status:", error);
		}
	};

	const handleDelete = async () => {
		if (!deleteDialog.election) return;

		try {
			await deleteElection(deleteDialog.election.id);
			setDeleteDialog({ open: false, election: null });
		} catch (error) {
			console.error("Failed to delete election:", error);
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Elections</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="animate-pulse space-y-2">
								<div className="h-4 bg-gray-200 rounded w-3/4"></div>
								<div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
					<h1 className="text-2xl font-bold">Elections</h1>
					<p className="text-muted-foreground">Manage your elections and candidates</p>
				</div>
				<Button onClick={onCreateNew}>
					<Plus className="w-4 h-4 mr-2" />
					Create Election
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex gap-4">
						<div className="flex-1">
							<Input
								placeholder="Search elections..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="archived">Archived</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Error Messages */}
			{(deleteError || statusError) && (
				<Alert variant="destructive">
					<AlertDescription>{deleteError || statusError}</AlertDescription>
				</Alert>
			)}

			{/* Elections List */}
			<div className="grid gap-4">
				{filteredElections.map((election) => (
					<Card key={election.id}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<CardTitle className="text-lg">{election.title}</CardTitle>
									<CardDescription>{election.description}</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant={getStatusColor(election.status)}>
										{getStatusIcon(election.status)}
										<span className="ml-1 capitalize">{election.status}</span>
									</Badge>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreVertical className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => onEdit(election.id)}>
												<Edit className="w-4 h-4 mr-2" />
												Edit
											</DropdownMenuItem>

											{election.status === "draft" && canActivate(election) && (
												<DropdownMenuItem
													onClick={() => handleStatusChange(election.id, "active")}
													disabled={isChangingStatus}
												>
													<Play className="w-4 h-4 mr-2" />
													Activate
												</DropdownMenuItem>
											)}

											{election.status === "active" && (
												<DropdownMenuItem
													onClick={() => handleStatusChange(election.id, "completed")}
													disabled={isChangingStatus}
												>
													<Square className="w-4 h-4 mr-2" />
													Complete
												</DropdownMenuItem>
											)}

											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => setDeleteDialog({ open: true, election })}
												disabled={isDeleting}
												className="text-destructive"
											>
												<Trash2 className="w-4 h-4 mr-2" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-3">
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Calendar className="w-4 h-4" />
									<span>
										{format(new Date(election.start_date), "MMM dd, yyyy")} -
										{format(new Date(election.end_date), "MMM dd, yyyy")}
									</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Users className="w-4 h-4" />
									<span>{election.candidates?.length || 0} candidates</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<Badge variant="outline">{election.category}</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredElections.length === 0 && (
				<Card>
					<CardContent className="pt-6">
						<div className="text-center py-8">
							<Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500">{searchTerm ? "No elections match your search" : "No elections yet"}</p>
							{!searchTerm && (
								<Button onClick={onCreateNew} className="mt-4">
									Create Your First Election
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Delete Confirmation */}
			<Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, election: null })}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Election</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deleteDialog.election?.title}"? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialog({ open: false, election: null })}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
							{isDeleting ? "Deleting..." : "Delete Election"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
