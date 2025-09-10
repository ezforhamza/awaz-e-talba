import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Alert, AlertDescription } from "@/ui/alert";
import { Calendar, Users } from "lucide-react";
import { useElections } from "@/hooks/elections";
import { BasicInformationSection } from "./election-form/BasicInformationSection";
import { VotingScheduleSection } from "./election-form/VotingScheduleSection";
import { VotingInstructionsSection } from "./election-form/VotingInstructionsSection";
import { NextStepsInfo } from "./election-form/NextStepsInfo";

interface ElectionFormData {
	title: string;
	description?: string;
	category: string;
	start_date: string;
	end_date: string;
	voting_instructions?: string;
	auto_start: boolean;
	auto_end: boolean;
}

interface ElectionFormProps {
	onSuccess: () => void;
	onCancel: () => void;
	initialData?: {
		id: string;
		title: string;
		description?: string;
		category: string;
		start_date: string;
		end_date: string;
		voting_instructions?: string;
		auto_start?: boolean;
		auto_end?: boolean;
	};
}

export function ElectionForm({ onSuccess, onCancel, initialData }: ElectionFormProps) {
	const [startDateTime, setStartDateTime] = useState<Date | undefined>(
		initialData?.start_date ? new Date(initialData.start_date) : undefined,
	);
	const [endDateTime, setEndDateTime] = useState<Date | undefined>(
		initialData?.end_date ? new Date(initialData.end_date) : undefined,
	);
	const [startNow, setStartNow] = useState(false);

	const { createElection, updateElection, isCreating, isUpdating, createError, updateError } = useElections();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
		trigger,
	} = useForm<ElectionFormData>({
		defaultValues: {
			title: initialData?.title || "",
			description: initialData?.description || "",
			category: initialData?.category || "",
			voting_instructions: initialData?.voting_instructions || "",
			auto_start: initialData?.auto_start ?? true,
			auto_end: initialData?.auto_end ?? true,
		},
	});

	// Register category field for validation
	register("category", { required: "Category is required" });

	const selectedCategory = watch("category");
	const autoStart = watch("auto_start");
	const autoEnd = watch("auto_end");
	const isEditing = !!initialData;
	const isLoading = isCreating || isUpdating;
	const error = createError || updateError;

	const onSubmit = async (data: ElectionFormData) => {
		// Handle "Start Now" option
		const finalStartDateTime = startNow ? new Date() : startDateTime;

		if (!finalStartDateTime || !endDateTime) {
			return;
		}

		if (endDateTime <= finalStartDateTime) {
			return;
		}

		try {
			const formattedData = {
				...data,
				start_date: finalStartDateTime.toISOString(),
				end_date: endDateTime.toISOString(),
			};

			if (isEditing && initialData) {
				await updateElection({
					id: initialData.id,
					...formattedData,
				});
			} else {
				await createElection(formattedData);
			}
			onSuccess();
		} catch (err) {
			console.error("Failed to save election:", err);
		}
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<Card className="shadow-lg">
				<CardHeader className="space-y-4 pb-8">
					<div className="flex items-center gap-3">
						<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
							<Calendar className="h-6 w-6 text-primary" />
						</div>
						<div>
							<CardTitle className="text-2xl">{isEditing ? "Edit Election" : "Create New Election"}</CardTitle>
							<CardDescription className="text-base mt-1">
								{isEditing
									? "Update election information and settings"
									: "Set up a new election with candidates and voting schedule"}
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="space-y-8">
						{error && (
							<Alert variant="destructive">
								<AlertDescription className="text-base">{error}</AlertDescription>
							</Alert>
						)}

						<BasicInformationSection
							register={register}
							errors={errors}
							setValue={setValue}
							trigger={trigger}
							watch={watch}
							isLoading={isLoading}
						/>

						<VotingScheduleSection
							startDateTime={startDateTime}
							endDateTime={endDateTime}
							setStartDateTime={setStartDateTime}
							setEndDateTime={setEndDateTime}
							startNow={startNow}
							setStartNow={setStartNow}
							autoStart={autoStart}
							autoEnd={autoEnd}
							setValue={setValue}
							isLoading={isLoading}
							isEditing={isEditing}
						/>

						<VotingInstructionsSection register={register} isLoading={isLoading} />
					</CardContent>

					<CardFooter className="flex justify-between pt-8">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isLoading}
							className="h-12 px-8 text-base"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								isLoading ||
								!selectedCategory ||
								(!startDateTime && !startNow) ||
								!endDateTime ||
								endDateTime <= (startNow ? new Date() : startDateTime!)
							}
							className="h-12 px-8 text-base"
						>
							{isLoading ? (
								isEditing ? (
									"Updating Election..."
								) : (
									"Creating Election..."
								)
							) : (
								<>
									{isEditing ? "Update Election" : "Create Election"}
									<Users className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					</CardFooter>
				</form>
			</Card>

			<NextStepsInfo isEditing={isEditing} />
		</div>
	);
}
