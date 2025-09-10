import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormTrigger, UseFormWatch } from "react-hook-form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Badge } from "@/ui/badge";
import { FileText } from "lucide-react";

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

interface BasicInformationSectionProps {
	register: UseFormRegister<ElectionFormData>;
	errors: FieldErrors<ElectionFormData>;
	setValue: UseFormSetValue<ElectionFormData>;
	trigger: UseFormTrigger<ElectionFormData>;
	watch: UseFormWatch<ElectionFormData>;
	isLoading: boolean;
}

const categories = [
	{ value: "Student Council", label: "Student Council", icon: "🏛️" },
	{ value: "Class Representative", label: "Class Representative", icon: "👥" },
	{ value: "Sports Committee", label: "Sports Committee", icon: "⚽" },
	{ value: "Cultural Committee", label: "Cultural Committee", icon: "🎭" },
	{ value: "Academic Council", label: "Academic Council", icon: "📚" },
	{ value: "Other", label: "Other", icon: "📝" },
];

export function BasicInformationSection({
	register,
	errors,
	setValue,
	trigger,
	watch,
	isLoading,
}: BasicInformationSectionProps) {
	const selectedCategory = watch("category");
	const selectedCategoryData = categories.find((c) => c.value === selectedCategory);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 mb-4">
				<FileText className="h-5 w-5 text-primary" />
				<h3 className="text-lg font-semibold">Basic Information</h3>
			</div>

			{selectedCategory && (
				<Badge variant="secondary" className="w-fit text-sm py-1 px-3">
					{selectedCategoryData?.icon} {selectedCategory}
				</Badge>
			)}

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-3">
					<Label htmlFor="title" className="text-base font-medium">
						Election Title *
					</Label>
					<Input
						id="title"
						{...register("title", { required: "Title is required" })}
						placeholder="e.g., Student Council President 2024"
						disabled={isLoading}
						className="h-12 text-base"
					/>
					{errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
				</div>

				<div className="space-y-3">
					<Label htmlFor="category" className="text-base font-medium">
						Election Category *
					</Label>
					<Select
						value={selectedCategory}
						onValueChange={(value) => {
							setValue("category", value);
							trigger("category");
						}}
						disabled={isLoading}
					>
						<SelectTrigger className="h-12 text-base">
							<SelectValue placeholder="Select election category" />
						</SelectTrigger>
						<SelectContent>
							{categories.map((category) => (
								<SelectItem key={category.value} value={category.value} className="text-base py-3">
									<div className="flex items-center gap-3">
										<span>{category.icon}</span>
										<span>{category.label}</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
				</div>
			</div>

			<div className="space-y-3">
				<Label htmlFor="description" className="text-base font-medium">
					Description
				</Label>
				<Textarea
					id="description"
					{...register("description")}
					placeholder="Brief description of the election and what candidates will be responsible for..."
					rows={4}
					disabled={isLoading}
					className="text-base"
				/>
			</div>
		</div>
	);
}
