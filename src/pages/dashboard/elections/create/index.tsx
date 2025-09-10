import { Icon } from "@/components/icon";
import { useCandidates } from "@/hooks/candidates";
import { useElections } from "@/hooks/elections";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Form } from "@/ui/form";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "@/routes/hooks";
import { toast } from "sonner";
import { useEffect } from "react";
import { formatDateForInput, convertLocalToUTC } from "@/utils/dateUtils";

// Import form components
import {
	FormHeader,
	LoadingOverlay,
	BasicInformationSection,
	ScheduleSection,
	SettingsSection,
	CandidateSelectionSection,
} from "./components";

interface ElectionFormData {
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	allow_multiple_votes: boolean;
	auto_start: boolean;
	candidate_ids: string[];
}

export default function CreateElection() {
	const router = useRouter();
	const params = useParams();
	const { candidates } = useCandidates();
	const { elections, createElection, updateElection, isCreating, isUpdating } = useElections();

	const electionId = params.id;
	const isEditing = !!electionId;
	const currentElection = isEditing ? elections.find((e) => e.id === electionId) : null;

	const form = useForm<ElectionFormData>({
		defaultValues: {
			title: "",
			description: "",
			start_date: "",
			end_date: "",
			allow_multiple_votes: false,
			auto_start: false,
			candidate_ids: [],
		},
	});

	// Populate form when editing
	useEffect(() => {
		if (currentElection) {
			form.reset({
				title: currentElection.title || "",
				description: currentElection.description || "",
				start_date: currentElection.start_date ? formatDateForInput(currentElection.start_date) : "",
				end_date: currentElection.end_date ? formatDateForInput(currentElection.end_date) : "",
				allow_multiple_votes: currentElection.allow_multiple_votes || false,
				auto_start: currentElection.auto_start || false,
				candidate_ids: currentElection.candidate_ids || [],
			});
		}
	}, [currentElection, form]);

	const handleSubmit = async (data: ElectionFormData) => {
		// Validate dates using local time for user-friendly validation
		const localStartDate = new Date(data.start_date);
		const localEndDate = new Date(data.end_date);

		if (localStartDate >= localEndDate) {
			toast.error("End date must be after start date");
			return;
		}

		if (localStartDate < new Date()) {
			toast.error("Start date cannot be in the past");
			return;
		}

		if (data.candidate_ids.length === 0) {
			toast.error("Please select at least one candidate");
			return;
		}

		// Prepare data with proper UTC timestamps
		const submitData = {
			...data,
			start_date: convertLocalToUTC(data.start_date),
			end_date: convertLocalToUTC(data.end_date),
		};

		try {
			if (isEditing) {
				await updateElection({ id: electionId, ...submitData });
				toast.success("Election updated successfully!");
			} else {
				await createElection(submitData);
				toast.success("Election created successfully!");
			}
			router.push("/elections");
		} catch (error) {
			toast.error(isEditing ? "Failed to update election" : "Failed to create election");
		}
	};

	const handleBack = () => {
		router.push("/elections");
	};

	return (
		<div className="container mx-auto p-6 space-y-8">
			{/* Header */}
			<FormHeader isEditing={isEditing} onBack={handleBack} />

			{/* Form Card */}
			<Card className="relative w-full">
				{/* Loading Overlay */}
				<LoadingOverlay isVisible={isCreating || isUpdating} isEditing={isEditing} />

				<CardContent className="p-6 md:p-8">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
							{/* Basic Information */}
							<BasicInformationSection control={form.control} isDisabled={isCreating || isUpdating} />

							{/* Schedule */}
							<ScheduleSection control={form.control} isDisabled={isCreating || isUpdating} />

							{/* Settings */}
							<SettingsSection control={form.control} isDisabled={isCreating || isUpdating} />

							{/* Candidate Selection */}
							<CandidateSelectionSection
								control={form.control}
								candidates={candidates}
								isDisabled={isCreating || isUpdating}
								onNavigateToCandidates={() => router.push("/candidates")}
							/>

							{/* Actions */}
							<div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
								<Button
									type="button"
									variant="outline"
									onClick={handleBack}
									disabled={isCreating || isUpdating}
									className="h-11 px-8"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isCreating || isUpdating || candidates.length === 0}
									className="h-11 px-8"
								>
									{(isCreating || isUpdating) && (
										<Icon icon="solar:refresh-outline" className="w-4 h-4 mr-2 animate-spin" />
									)}
									{isCreating || isUpdating
										? isEditing
											? "Updating..."
											: "Creating..."
										: isEditing
											? "Update Election"
											: "Create Election"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
