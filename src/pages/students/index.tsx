import { useState } from "react";
import { BulkStudentActions } from "@/components/admin/BulkStudentActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Checkbox } from "@/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Switch } from "@/ui/switch";
import { Search, Plus, GraduationCap } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";

export default function Students() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

	const { students, stats, isLoading, toggleActiveStatus, isToggling } = useStudents();

	const filteredStudents = students.filter(
		(student) =>
			student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.voting_id.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handleStudentSelect = (studentId: string, checked: boolean) => {
		if (checked) {
			setSelectedStudents((prev) => [...prev, studentId]);
		} else {
			setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
		}
	};

	const handleToggleActive = async (studentId: string, isActive: boolean) => {
		try {
			await toggleActiveStatus({ id: studentId, is_active: isActive });
		} catch (error) {
			console.error("Failed to toggle student status:", error);
		}
	};

	const handleRefresh = () => {
		// The hook automatically refetches data
		setSelectedStudents([]);
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Students</h1>
					<div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
				</div>
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-4">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex items-center space-x-4 animate-pulse">
									<div className="h-4 w-4 bg-gray-200 rounded"></div>
									<div className="h-10 w-10 bg-gray-200 rounded-full"></div>
									<div className="space-y-2 flex-1">
										<div className="h-4 bg-gray-200 rounded w-3/4"></div>
										<div className="h-3 bg-gray-200 rounded w-1/2"></div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Students</h1>
					<p className="text-muted-foreground">Manage student accounts and voting access</p>
				</div>
				<Button>
					<Plus className="w-4 h-4 mr-2" />
					Add Student
				</Button>
			</div>

			{/* Bulk Actions */}
			<BulkStudentActions
				students={filteredStudents}
				selectedStudents={selectedStudents}
				onSelectionChange={setSelectedStudents}
				onRefresh={handleRefresh}
			/>

			{/* Search */}
			<Card>
				<CardContent className="pt-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search by name, roll number, or voting ID..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Students Table */}
			<Card>
				<CardHeader>
					<CardTitle>All Students</CardTitle>
					<CardDescription>
						{filteredStudents.length} of {students.length} students
						{stats && (
							<span className="ml-2">
								• {stats.active} active • {stats.inactive} inactive
							</span>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{filteredStudents.length === 0 ? (
						<div className="text-center py-8">
							<GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500">{searchTerm ? "No students match your search" : "No students yet"}</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={selectedStudents.length === filteredStudents.length}
											onCheckedChange={(checked) => {
												if (checked) {
													setSelectedStudents(filteredStudents.map((s) => s.id));
												} else {
													setSelectedStudents([]);
												}
											}}
										/>
									</TableHead>
									<TableHead>Student</TableHead>
									<TableHead>Class/Section</TableHead>
									<TableHead>Voting ID</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Active</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredStudents.map((student) => (
									<TableRow key={student.id}>
										<TableCell>
											<Checkbox
												checked={selectedStudents.includes(student.id)}
												onCheckedChange={(checked) => handleStudentSelect(student.id, checked as boolean)}
											/>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarFallback>
														{student.name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.slice(0, 2)}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{student.name}</p>
													<p className="text-sm text-muted-foreground">{student.roll_number}</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											{student.class && student.section ? (
												<Badge variant="outline">
													{student.class}-{student.section}
												</Badge>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell>
											<code className="text-xs bg-muted px-2 py-1 rounded">{student.voting_id}</code>
										</TableCell>
										<TableCell>
											<Badge variant={student.is_active ? "default" : "secondary"}>
												{student.is_active ? "Active" : "Inactive"}
											</Badge>
										</TableCell>
										<TableCell>
											<Switch
												checked={student.is_active}
												onCheckedChange={(checked) => handleToggleActive(student.id, checked)}
												disabled={isToggling}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
