import { useState } from "react";
import { ElectionForm } from "@/components/admin/ElectionForm";
import { useElections } from "@/hooks/elections";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Alert, AlertDescription } from "@/ui/alert";
import { Calendar, Users, Play, Square, Edit, Trash2, Plus, ArrowLeft, Clock, Zap } from "lucide-react";
import { format } from "date-fns";

type ViewState = "list" | "create" | "edit";

export default function Elections() {
	const [viewState, setViewState] = useState<ViewState>("list");
	const [editingElectionId, setEditingElectionId] = useState<string | null>(null);
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; election: any | null }>({
		open: false,
		election: null,
	});

	const {
		elections,
		isLoading,
		deleteElection,
		changeElectionStatus,
		isDeleting,
		isChangingStatus,
		deleteError,
		statusError,
	} = useElections();

	const handleCreateNew = () => {
		setViewState("create");
	};

	const handleEdit = (electionId: string) => {
		setEditingElectionId(electionId);
		setViewState("edit");
	};

	const handleBackToList = () => {
		setViewState("list");
		setEditingElectionId(null);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "draft":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "active":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "completed":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "archived":
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	const canActivate = (election: any) => {
		return election.status === "draft" && election.candidates && election.candidates.length >= 2;
	};

	const canForceStart = (election: any) => {
		return election.status === "draft" && election.candidates && election.candidates.length >= 1;
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

	if (viewState === "create") {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" onClick={handleBackToList} className="flex items-center gap-2">
						<ArrowLeft className="w-4 h-4" />
						Back to Elections
					</Button>
					<h1 className="text-3xl font-bold">Create New Election</h1>
				</div>
				<ElectionForm onSuccess={handleBackToList} onCancel={handleBackToList} />
			</div>
		);
	}

	if (viewState === "edit" && editingElectionId) {
		const editingElection = elections.find((e) => e.id === editingElectionId);

		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" onClick={handleBackToList} className="flex items-center gap-2">
						<ArrowLeft className="w-4 h-4" />
						Back to Elections
					</Button>
					<h1 className="text-3xl font-bold">Edit Election</h1>
				</div>
				{editingElection ? (
					<ElectionForm initialData={editingElection} onSuccess={handleBackToList} onCancel={handleBackToList} />
				) : (
					<div className="text-center py-8">
						<p className="text-muted-foreground">Election not found</p>
						<Button onClick={handleBackToList} className="mt-4">
							Back to Elections
						</Button>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Clean Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-4xl font-bold text-foreground">Elections</h1>
					<p className="text-lg text-muted-foreground mt-2">Manage your elections and voting campaigns</p>
				</div>
				<Button
					onClick={handleCreateNew}
					size="lg"
					className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
				>
					<Plus className="w-5 h-5 mr-2" />
					Create Election
				</Button>
			</div>

			{/* Error Messages */}
			{(deleteError || statusError) && (
				<Alert variant="destructive">
					<AlertDescription>{deleteError || statusError}</AlertDescription>
				</Alert>
			)}

			{/* Elections Grid */}
			{isLoading ? (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
								<div className="h-4 bg-muted rounded w-1/2"></div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="h-4 bg-muted rounded w-full"></div>
									<div className="h-4 bg-muted rounded w-2/3"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : elections.length === 0 ? (
				<Card className="py-16">
					<CardContent className="text-center">
						<Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
						<h3 className="text-xl font-semibold text-foreground mb-2">No Elections Yet</h3>
						<p className="text-muted-foreground mb-6">Get started by creating your first election campaign</p>
						<Button onClick={handleCreateNew} size="lg">
							<Plus className="w-5 h-5 mr-2" />
							Create Your First Election
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{elections.map((election) => (
						<Card
							key={election.id}
							className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30"
						>
							<CardHeader className="pb-4">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
											{election.title}
										</CardTitle>
										<Badge className={`px-3 py-1 font-medium ${getStatusColor(election.status)}`}>
											{election.status.charAt(0).toUpperCase() + election.status.slice(1)}
										</Badge>
									</div>
								</div>
								{election.description && (
									<p className="text-muted-foreground text-sm leading-relaxed mt-3">{election.description}</p>
								)}
							</CardHeader>

							<CardContent className="space-y-4">
								{/* Election Info */}
								<div className="space-y-3 text-sm">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Calendar className="w-4 h-4" />
										<span>
											{format(new Date(election.start_date), "MMM dd")} -{" "}
											{format(new Date(election.end_date), "MMM dd, yyyy")}
										</span>
									</div>
									<div className="flex items-center gap-2 text-muted-foreground">
										<Users className="w-4 h-4" />
										<span>{election.candidates?.length || 0} candidates</span>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline" className="text-xs">
											{election.category}
										</Badge>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-2 pt-2">
									<Button variant="outline" size="sm" onClick={() => handleEdit(election.id)} className="flex-1">
										<Edit className="w-4 h-4 mr-1" />
										Edit
									</Button>

									{/* Status Control Buttons */}
									{election.status === "draft" && canActivate(election) && (
										<Button
											size="sm"
											onClick={() => handleStatusChange(election.id, "active")}
											disabled={isChangingStatus}
											className="bg-green-600 hover:bg-green-700"
										>
											<Play className="w-4 h-4 mr-1" />
											Start
										</Button>
									)}

									{election.status === "draft" && canForceStart(election) && !canActivate(election) && (
										<Button
											size="sm"
											onClick={() => handleStatusChange(election.id, "active")}
											disabled={isChangingStatus}
											className="bg-orange-600 hover:bg-orange-700"
											title="Force start (requires at least 1 candidate)"
										>
											<Zap className="w-4 h-4 mr-1" />
											Force Start
										</Button>
									)}

									{election.status === "active" && (
										<Button
											size="sm"
											onClick={() => handleStatusChange(election.id, "completed")}
											disabled={isChangingStatus}
											className="bg-red-600 hover:bg-red-700"
										>
											<Square className="w-4 h-4 mr-1" />
											Stop
										</Button>
									)}

									{election.status === "draft" && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => setDeleteDialog({ open: true, election })}
											disabled={isDeleting}
											className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									)}
								</div>

								{/* Status Messages */}
								{election.status === "draft" && (!election.candidates || election.candidates.length < 2) && (
									<div className="text-xs text-amber-600 bg-amber-50 p-2 rounded flex items-center gap-2">
										<Clock className="w-3 h-3" />
										{!election.candidates || election.candidates.length === 0
											? "Add candidates to start election"
											: "Add at least 2 candidates for normal start"}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
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
