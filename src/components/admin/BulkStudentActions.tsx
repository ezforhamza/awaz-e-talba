import { useState } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Alert, AlertDescription } from "@/ui/alert";
import { Checkbox } from "@/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Trash2, Download, Upload, Users, AlertTriangle } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";

interface Student {
	id: string;
	name: string;
	roll_number: string;
	email?: string;
	class?: string;
	section?: string;
	voting_id: string;
	is_active: boolean;
}

interface BulkStudentActionsProps {
	students: Student[];
	selectedStudents: string[];
	onSelectionChange: (studentIds: string[]) => void;
	onRefresh: () => void;
}

export function BulkStudentActions({
	students,
	selectedStudents,
	onSelectionChange,
	onRefresh,
}: BulkStudentActionsProps) {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [forceDelete, setForceDelete] = useState(false);

	const { bulkDeleteStudents, generateTemplate, isBulkDeleting, bulkDeleteError, stats } = useStudents();

	const selectedCount = selectedStudents.length;
	const allSelected = selectedCount === students.length && students.length > 0;
	const someSelected = selectedCount > 0 && selectedCount < students.length;

	const handleSelectAll = () => {
		if (allSelected) {
			onSelectionChange([]);
		} else {
			onSelectionChange(students.map((s) => s.id));
		}
	};

	const handleBulkDelete = async () => {
		try {
			await bulkDeleteStudents(selectedStudents, forceDelete);
			setShowDeleteConfirm(false);
			setForceDelete(false);
			onSelectionChange([]);
			onRefresh();
		} catch (error) {
			console.error("Bulk delete failed:", error);
		}
	};

	const selectedStudentNames = students
		.filter((s) => selectedStudents.includes(s.id))
		.map((s) => s.name)
		.slice(0, 3);

	return (
		<div className="space-y-4">
			{/* Selection Controls */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg">Student Management</CardTitle>
							<CardDescription>Manage students in bulk</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="secondary">
								<Users className="w-3 h-3 mr-1" />
								{students.length} total
							</Badge>
							{stats && <Badge variant="outline">{stats.active} active</Badge>}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="select-all"
									checked={allSelected}
									ref={(el) => {
										if (el) el.indeterminate = someSelected;
									}}
									onCheckedChange={handleSelectAll}
								/>
								<label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
									Select all ({students.length})
								</label>
							</div>
							{selectedCount > 0 && <Badge variant="secondary">{selectedCount} selected</Badge>}
						</div>

						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" onClick={generateTemplate}>
								<Download className="w-4 h-4 mr-2" />
								Template
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									/* Handle bulk upload */
								}}
							>
								<Upload className="w-4 h-4 mr-2" />
								Import
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Bulk Actions */}
			{selectedCount > 0 && (
				<Card className="border-amber-200 bg-amber-50">
					<CardContent className="pt-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
									<Users className="h-4 w-4 text-amber-600" />
								</div>
								<div>
									<p className="font-medium text-amber-900">
										{selectedCount} student{selectedCount > 1 ? "s" : ""} selected
									</p>
									<p className="text-sm text-amber-700">
										{selectedStudentNames.join(", ")}
										{selectedCount > 3 && ` and ${selectedCount - 3} more`}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm" onClick={() => onSelectionChange([])}>
									Clear Selection
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setShowDeleteConfirm(true)}
									disabled={isBulkDeleting}
								>
									<Trash2 className="w-4 h-4 mr-2" />
									{isBulkDeleting ? "Deleting..." : "Delete Selected"}
								</Button>
							</div>
						</div>

						{bulkDeleteError && (
							<Alert variant="destructive" className="mt-4">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>{bulkDeleteError}</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</Card>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Bulk Delete</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete {selectedCount} student{selectedCount > 1 ? "s" : ""}?
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								This action cannot be undone.{" "}
								{!forceDelete && "Students who have voted cannot be deleted unless forced."}
							</AlertDescription>
						</Alert>

						<div className="bg-gray-50 p-3 rounded-md">
							<p className="text-sm font-medium mb-2">Students to delete:</p>
							<div className="text-sm text-gray-600">
								{selectedStudentNames.join(", ")}
								{selectedCount > 3 && <span className="text-gray-500"> and {selectedCount - 3} more</span>}
							</div>
						</div>

						<div className="flex items-start space-x-2 p-3 border rounded-md bg-amber-50">
							<Checkbox id="force-delete" checked={forceDelete} onCheckedChange={setForceDelete} />
							<div className="space-y-1">
								<label htmlFor="force-delete" className="text-sm font-medium cursor-pointer text-amber-900">
									Force delete students who have voted
								</label>
								<p className="text-xs text-amber-700">
									This will also delete all voting records associated with these students. This action is irreversible.
								</p>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isBulkDeleting}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleBulkDelete} disabled={isBulkDeleting}>
							{isBulkDeleting
								? "Deleting..."
								: forceDelete
									? `Force Delete ${selectedCount} Student${selectedCount > 1 ? "s" : ""}`
									: `Delete ${selectedCount} Student${selectedCount > 1 ? "s" : ""}`}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
