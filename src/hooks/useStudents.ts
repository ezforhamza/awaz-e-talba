import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentAdmin } from "./useCurrentAdmin";
import { createVoterHash } from "@/utils/security";

interface Student {
	id: string;
	name: string;
	roll_number: string;
	email: string | null;
	class: string | null;
	section: string | null;
	voting_id: string;
	is_active: boolean;
	admin_id: string | null;
	created_at: string;
	updated_at: string;
}

interface CreateStudentData {
	name: string;
	roll_number: string;
	email?: string;
	class?: string;
	section?: string;
	voting_id?: string;
}

interface BulkUploadData {
	students: CreateStudentData[];
}

export const useStudents = () => {
	const queryClient = useQueryClient();
	const { adminId, isLoading: isAdminLoading } = useCurrentAdmin();

	// Fetch students
	const {
		data: students,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["students", adminId],
		enabled: !!adminId && !isAdminLoading,
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false });

			if (error) throw new Error(error.message);
			return data as Student[];
		},
	});

	// Create student mutation
	const createStudentMutation = useMutation({
		mutationFn: async (studentData: CreateStudentData) => {
			// Auto-generate voting_id if not provided
			let finalData = { ...studentData };
			if (!finalData.voting_id) {
				// Generate a shorter unique voting ID: V + roll_number + random 4 digits
				let attempts = 0;
				let votingId = "";

				do {
					const randomSuffix = Math.floor(1000 + Math.random() * 9000);
					const cleanRollNumber = finalData.roll_number
						.replace(/[^a-zA-Z0-9]/g, "")
						.toUpperCase()
						.slice(0, 8);
					votingId = `V${cleanRollNumber}${randomSuffix}`;

					// Check if this voting ID already exists
					const { data: existing } = await supabase.from("students").select("id").eq("voting_id", votingId).single();

					if (!existing) break;
					attempts++;
				} while (attempts < 5);

				if (attempts >= 5) {
					throw new Error("Could not generate unique voting ID after 5 attempts");
				}

				finalData.voting_id = votingId;
			}

			if (!adminId) {
				throw new Error("Please wait for authentication to complete");
			}

			// Add admin_id to the data and handle optional fields
			const dataWithAdmin = {
				...finalData,
				admin_id: adminId,
				email: finalData.email?.trim() || null,
				class: finalData.class?.trim() || null,
				section: finalData.section?.trim() || null,
			};

			const { data, error } = await supabase.from("students").insert([dataWithAdmin]).select().single();

			if (error) {
				console.error("Student creation error:", error);

				// Handle specific constraint violations with user-friendly messages
				if (error.code === "23505" && error.message.includes("students_admin_id_roll_number_key")) {
					throw new Error(
						`A student with roll number "${finalData.roll_number}" already exists. Please use a different roll number.`,
					);
				}

				// Handle other potential constraint violations
				if (error.code === "23505" && error.message.includes("students_voting_id_key")) {
					throw new Error("A student with this voting ID already exists. Please try again.");
				}

				// Generic error for other cases
				throw new Error(error.message);
			}
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["students"] });
		},
	});

	// Bulk upload students mutation
	const bulkUploadMutation = useMutation({
		mutationFn: async (bulkData: BulkUploadData) => {
			if (!adminId) {
				throw new Error("Please wait for authentication to complete");
			}

			// Add admin_id to each student and clean up optional fields
			const studentsWithAdmin = bulkData.students.map((student) => ({
				...student,
				admin_id: adminId,
				// Auto-generate voting_id if not provided
				voting_id:
					student.voting_id ||
					`V${student.roll_number
						.replace(/[^a-zA-Z0-9]/g, "")
						.toUpperCase()
						.slice(0, 8)}${Math.floor(1000 + Math.random() * 9000)}`,
				// Handle optional email field properly
				email: student.email?.trim() || null,
				class: student.class?.trim() || null,
				section: student.section?.trim() || null,
			}));

			const { data, error } = await supabase.from("students").insert(studentsWithAdmin).select();

			if (error) {
				console.error("Bulk upload error:", error);

				// Handle specific constraint violations with user-friendly messages
				if (error.code === "23505" && error.message.includes("students_admin_id_roll_number_key")) {
					const duplicateMatch = error.message.match(/\(admin_id, roll_number\)=\([^)]+, ([^)]+)\)/);
					const duplicateRollNumber = duplicateMatch ? duplicateMatch[1] : "unknown";
					throw new Error(
						`Duplicate roll number found: "${duplicateRollNumber}" already exists. Please check your data and ensure all roll numbers are unique.`,
					);
				}

				if (error.code === "23505" && error.message.includes("students_voting_id_key")) {
					throw new Error("One or more voting IDs already exist. Please try again with different data.");
				}

				// Generic error for other cases
				throw new Error(error.message);
			}
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["students"] });
		},
	});

	// Update student mutation
	const updateStudentMutation = useMutation({
		mutationFn: async ({ id, ...updateData }: Partial<CreateStudentData> & { id: string }) => {
			// Get current user to verify admin_id
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}

			const { data, error } = await supabase
				.from("students")
				.update(updateData)
				.eq("id", id)
				.eq("admin_id", user.id) // Ensure user can only update their own students
				.select()
				.single();

			if (error) {
				console.error("Student update error:", error);

				// Handle specific constraint violations with user-friendly messages
				if (error.code === "23505" && error.message.includes("students_admin_id_roll_number_key")) {
					throw new Error(
						`A student with roll number "${updateData.roll_number}" already exists. Please use a different roll number.`,
					);
				}

				if (error.code === "23505" && error.message.includes("students_voting_id_key")) {
					throw new Error("A student with this voting ID already exists. Please try again.");
				}

				// Generic error for other cases
				throw new Error(error.message);
			}
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["students"] });
		},
	});

	// Delete student mutation
	const deleteStudentMutation = useMutation({
		mutationFn: async ({ id, force = false }: { id: string; force?: boolean }) => {
			// Get current user to verify admin_id
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}

			if (force) {
				// Use the database function for force delete to avoid RLS policy issues
				const { data, error } = await supabase.rpc("force_delete_students", {
					student_ids: [id],
					admin_user_id: user.id,
				});

				if (error) {
					console.error("Force delete error:", error);
					throw new Error(error.message);
				}

				return data;
			} else {
				const student = (students || []).find((s) => s.id === id);
				if (!student) {
					throw new Error("Student not found");
				}

				// Check if student has voted in any election
				const { data: votes } = await supabase.from("votes").select("id").eq("student_voting_id", student.voting_id);

				if (votes && votes.length > 0) {
					throw new Error("Cannot delete student who has already voted in elections. Use force delete to override.");
				}

				// Regular delete if no votes found
				const { error } = await supabase.from("students").delete().eq("id", id).eq("admin_id", user.id);

				if (error) throw new Error(error.message);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["students"] });
		},
	});

	// Bulk delete students mutation
	const bulkDeleteStudentsMutation = useMutation({
		mutationFn: async ({ ids, force = false }: { ids: string[]; force?: boolean }) => {
			// Get current user to verify admin_id
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}

			if (force) {
				// Use the database function for force delete to avoid RLS policy issues
				const { data, error } = await supabase.rpc("force_delete_students", {
					student_ids: ids,
					admin_user_id: user.id,
				});

				if (error) {
					console.error("Force delete error:", error);
					throw new Error(error.message);
				}

				return data;
			} else {
				// For non-force delete, check if students have voted first
				const studentsToDelete = (students || []).filter((s) => ids.includes(s.id));
				const votingIds = studentsToDelete.map((s) => s.voting_id);

				// Check if any students have voted using encrypted hashes
				const voterHashes = await Promise.all(votingIds.map((votingId) => createVoterHash(votingId)));

				const { data: votes } = await supabase
					.from("votes")
					.select("encrypted_voter_hash")
					.in("encrypted_voter_hash", voterHashes);

				if (votes && votes.length > 0) {
					throw new Error(
						`Cannot delete students who have already voted in elections. Found ${votes.length} students with voting history. Use force delete to override.`,
					);
				}

				// Regular delete if no votes found
				const { error } = await supabase.from("students").delete().in("id", ids).eq("admin_id", user.id);

				if (error) throw new Error(error.message);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["students"] });
		},
	});

	// Toggle student active status
	const toggleActiveStatusMutation = useMutation({
		mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
			// Get current user to verify admin_id
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}

			const { data, error } = await supabase
				.from("students")
				.update({ is_active })
				.eq("id", id)
				.eq("admin_id", user.id) // Ensure user can only update their own students
				.select()
				.single();

			if (error) throw new Error(error.message);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["students"] });
		},
	});

	// Calculate stats
	const stats = students
		? {
				total: students.length,
				active: students.filter((s) => s.is_active).length,
				inactive: students.filter((s) => !s.is_active).length,
				withEmail: students.filter((s) => s.email).length,
			}
		: null;

	// Generate bulk upload template
	const generateTemplate = () => {
		const headers = ["name", "roll_number", "email", "class", "section", "voting_id"];
		const sampleData = [
			["John Doe", "ROLL001", "john@school.com", "10", "A", "VOTE001"],
			["Jane Smith", "ROLL002", "jane@school.com", "10", "B", "VOTE002"],
		];

		const csvContent = [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "students_template.csv";
		link.click();
		window.URL.revokeObjectURL(url);
	};

	return {
		students: students || [],
		stats,
		isLoading,
		error: error?.message,
		createStudent: createStudentMutation.mutateAsync,
		bulkUpload: bulkUploadMutation.mutateAsync,
		updateStudent: updateStudentMutation.mutateAsync,
		deleteStudent: (id: string, force = false) => deleteStudentMutation.mutateAsync({ id, force }),
		bulkDeleteStudents: (ids: string[], force = false) => bulkDeleteStudentsMutation.mutateAsync({ ids, force }),
		toggleActiveStatus: toggleActiveStatusMutation.mutateAsync,
		generateTemplate,
		isCreating: createStudentMutation.isPending,
		isBulkUploading: bulkUploadMutation.isPending,
		isUpdating: updateStudentMutation.isPending,
		isDeleting: deleteStudentMutation.isPending,
		isBulkDeleting: bulkDeleteStudentsMutation.isPending,
		isToggling: toggleActiveStatusMutation.isPending,
		createError: createStudentMutation.error?.message,
		bulkUploadError: bulkUploadMutation.error?.message,
		updateError: updateStudentMutation.error?.message,
		deleteError: deleteStudentMutation.error?.message,
		bulkDeleteError: bulkDeleteStudentsMutation.error?.message,
		toggleError: toggleActiveStatusMutation.error?.message,
	};
};
