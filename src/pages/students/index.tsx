import { Icon } from "@/components/icon";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useStudents } from "@/hooks/useStudents";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Switch } from "@/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/routes/hooks";

export default function Students() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const { 
    students, 
    stats, 
    isLoading, 
    deleteStudent,
    toggleActiveStatus,
    generateTemplate,
    isDeleting,
    isToggling 
  } = useStudents();

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.voting_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && student.is_active) ||
                         (statusFilter === "inactive" && !student.is_active);
    
    const matchesClass = classFilter === "all" || student.class === classFilter;
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  // Get unique classes for filter
  const uniqueClasses = [...new Set(students.map(s => s.class).filter(Boolean))].sort();

  const handleDeleteStudent = (id: string, name: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Student",
      description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteStudent(id);
          toast.success("Student deleted successfully!");
        } catch (error: any) {
          toast.error(error.message || "Failed to delete student");
        }
      }
    });
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleActiveStatus({ id, is_active: !currentStatus });
      toast.success(`Student ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update student status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Icon icon="solar:refresh-outline" className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Students Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage student records and voting access
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline"
            onClick={generateTemplate}
            className="flex-1 sm:flex-none"
          >
            <Icon icon="solar:download-outline" className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/bulk-upload")}
            className="flex-1 sm:flex-none"
          >
            <Icon icon="solar:upload-outline" className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button 
            className="flex-1 sm:flex-none"
            onClick={() => router.push("/students/create")}
          >
            <Icon icon="solar:user-plus-outline" className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>


      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search students by name, roll number, voting ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="bg-muted/50">Name</TableHead>
                  <TableHead className="bg-muted/50">Roll Number</TableHead>
                  <TableHead className="bg-muted/50">Voting ID</TableHead>
                  <TableHead className="bg-muted/50">Class</TableHead>
                  <TableHead className="bg-muted/50">Section</TableHead>
                  <TableHead className="bg-muted/50">Email</TableHead>
                  <TableHead className="bg-muted/50">Status</TableHead>
                  <TableHead className="bg-muted/50">Added</TableHead>
                  <TableHead className="text-right bg-muted/50">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <Icon icon="solar:user-search-outline" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No students found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== "all" || classFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Get started by uploading student data"
                        }
                      </p>
                      {!searchTerm && statusFilter === "all" && classFilter === "all" && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Button onClick={() => router.push("/students/create")}>
                            <Icon icon="solar:user-plus-outline" className="w-4 h-4 mr-2" />
                            Add Student
                          </Button>
                          <Button variant="outline" onClick={generateTemplate}>
                            <Icon icon="solar:download-outline" className="w-4 h-4 mr-2" />
                            Download Template
                          </Button>
                          <Button variant="outline" onClick={() => router.push("/bulk-upload")}>
                            <Icon icon="solar:upload-outline" className="w-4 h-4 mr-2" />
                            Bulk Upload
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.roll_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.voting_id}</Badge>
                      </TableCell>
                      <TableCell>{student.class || "-"}</TableCell>
                      <TableCell>{student.section || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.email || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={student.is_active}
                            onCheckedChange={() => handleToggleStatus(student.id, student.is_active)}
                            disabled={isToggling}
                          />
                          <Badge variant={student.is_active ? "default" : "secondary"}>
                            {student.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(student.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push(`/students/edit/${student.id}`)}
                          >
                            <Icon icon="solar:pen-outline" className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            disabled={isDeleting}
                          >
                            <Icon icon="solar:trash-bin-minimalistic-outline" className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          </div>

          {filteredStudents.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
              <span>Showing {filteredStudents.length} of {students.length} students</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
        isLoading={isDeleting}
        confirmText="Delete"
      />
    </div>
  );
}