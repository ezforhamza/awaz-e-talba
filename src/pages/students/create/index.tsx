import { Icon } from "@/components/icon";
import { useStudents } from "@/hooks/useStudents";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "@/routes/hooks";
import { toast } from "sonner";

interface StudentFormData {
  name: string;
  roll_number: string;
  email?: string;
  class?: string;
  section?: string;
  is_active: boolean;
}

export default function CreateStudent() {
  const router = useRouter();
  const params = useParams();
  const { students, createStudent, updateStudent, isCreating, isUpdating } = useStudents();
  
  const studentId = params.id;
  const isEditing = !!studentId;
  const currentStudent = isEditing ? students.find(s => s.id === studentId) : null;
  
  const form = useForm<StudentFormData>({
    defaultValues: {
      name: "",
      roll_number: "",
      email: "",
      class: "",
      section: "",
      is_active: true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (currentStudent) {
      form.reset({
        name: currentStudent.name || "",
        roll_number: currentStudent.roll_number || "",
        email: currentStudent.email || "",
        class: currentStudent.class || "",
        section: currentStudent.section || "",
        is_active: currentStudent.is_active ?? true,
      });
    }
  }, [currentStudent, form]);

  const handleSubmit = async (data: StudentFormData) => {
    try {
      if (isEditing) {
        await updateStudent({ id: studentId, ...data });
        toast.success("Student updated successfully!");
      } else {
        await createStudent(data);
        toast.success("Student added successfully!");
      }
      router.push("/students");
    } catch (error: any) {
      toast.error(error.message || (isEditing ? "Failed to update student" : "Failed to add student"));
    }
  };

  const handleBack = () => {
    router.push("/students");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <Icon icon="solar:arrow-left-outline" className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
      </div>

      <h1 className="text-3xl font-bold">{isEditing ? "Edit Student" : "Add New Student"}</h1>

      {/* Form Card */}
      <Card className="max-w-2xl mx-auto relative">
        {/* Loading Overlay */}
        {(isCreating || isUpdating) && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <Icon icon="solar:refresh-outline" className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">{isEditing ? "Updating student..." : "Adding student..."}</p>
            </div>
          </div>
        )}

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Student name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Ahmed Hassan"
                          disabled={isCreating || isUpdating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roll_number"
                  rules={{ required: "Roll number is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., ROLL001"
                          disabled={isCreating || isUpdating}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for the student (Voting ID will be auto-generated)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="e.g., ahmed@school.edu"
                          disabled={isCreating || isUpdating}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional - for notifications and communication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 10, Grade 12"
                            disabled={isCreating || isUpdating}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., A, B, Science"
                            disabled={isCreating || isUpdating}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          Allow this student to participate in elections
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isCreating || isUpdating}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Icon icon="solar:refresh-outline" className="w-4 h-4 mr-2 animate-spin" />}
                  {(isCreating || isUpdating) 
                    ? (isEditing ? "Updating..." : "Adding...") 
                    : (isEditing ? "Update Student" : "Add Student")
                  }
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}