import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Alert, AlertDescription } from "@/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { useCandidates } from "@/hooks/candidates";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User, Image, Hash, FileText, Upload, X, Loader2, UserCheck } from "lucide-react";

interface CandidateFormData {
	name: string;
	description?: string;
	position: number;
	profile_image_url?: string;
	election_symbol_url?: string;
}

interface CandidateFormProps {
	electionId: string;
	onSuccess: () => void;
	onCancel: () => void;
	initialData?: {
		id: string;
		name: string;
		description?: string;
		position: number;
		profile_image_url?: string;
		election_symbol_url?: string;
	};
}

export function CandidateForm({ electionId, onSuccess, onCancel, initialData }: CandidateFormProps) {
	const [profileImage, setProfileImage] = useState<File | null>(null);
	const [electionSymbol, setElectionSymbol] = useState<File | null>(null);
	const [profileImagePreview, setProfileImagePreview] = useState<string | null>(initialData?.profile_image_url || null);
	const [symbolImagePreview, setSymbolImagePreview] = useState<string | null>(initialData?.election_symbol_url || null);

	const { createCandidate, updateCandidate, getNextPosition, isCreating, isUpdating, createError, updateError } =
		useCandidates(electionId);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<CandidateFormData>({
		defaultValues: {
			name: initialData?.name || "",
			description: initialData?.description || "",
			position: initialData?.position || getNextPosition(),
		},
	});

	const isEditing = !!initialData;
	const isLoading = isCreating || isUpdating;
	const error = createError || updateError;

	const uploadToSupabase = async (file: File, folder: string): Promise<string> => {
		const fileExt = file.name.split(".").pop();
		const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

		const { data, error } = await supabase.storage.from("uploads").upload(fileName, file, {
			cacheControl: "3600",
			upsert: false,
		});

		if (error) throw error;

		const { data: publicUrl } = supabase.storage.from("uploads").getPublicUrl(data.path);

		return publicUrl.publicUrl;
	};

	const handleProfileImageChange = (file: File | null) => {
		if (file) {
			setProfileImage(file);
			// Create preview URL for immediate UI feedback
			const previewUrl = URL.createObjectURL(file);
			setProfileImagePreview(previewUrl);
		} else {
			setProfileImage(null);
			setProfileImagePreview(initialData?.profile_image_url || null);
			// Clean up previous preview URL if it was a blob
			if (profileImagePreview && profileImagePreview.startsWith("blob:")) {
				URL.revokeObjectURL(profileImagePreview);
			}
		}
	};

	const handleElectionSymbolChange = (file: File | null) => {
		if (file) {
			setElectionSymbol(file);
			// Create preview URL for immediate UI feedback
			const previewUrl = URL.createObjectURL(file);
			setSymbolImagePreview(previewUrl);
		} else {
			setElectionSymbol(null);
			setSymbolImagePreview(initialData?.election_symbol_url || null);
			// Clean up previous preview URL if it was a blob
			if (symbolImagePreview && symbolImagePreview.startsWith("blob:")) {
				URL.revokeObjectURL(symbolImagePreview);
			}
		}
	};

	const onSubmit = async (data: CandidateFormData) => {
		const loadingToast = toast.loading(isEditing ? "Updating candidate..." : "Creating candidate...");

		try {
			let profileImageUrl: string | undefined;
			let symbolImageUrl: string | undefined;

			// Show upload progress for images
			if (profileImage) {
				toast.loading("Uploading profile photo...", { id: loadingToast });
				profileImageUrl = await uploadToSupabase(profileImage, "candidates/profiles");
			} else if (initialData?.profile_image_url) {
				profileImageUrl = initialData.profile_image_url;
			}

			if (electionSymbol) {
				toast.loading("Uploading election symbol...", { id: loadingToast });
				symbolImageUrl = await uploadToSupabase(electionSymbol, "candidates/symbols");
			} else if (initialData?.election_symbol_url) {
				symbolImageUrl = initialData.election_symbol_url;
			}

			// Update loading message for final save
			toast.loading(isEditing ? "Saving changes..." : "Saving candidate...", { id: loadingToast });

			const candidateData = {
				name: data.name,
				description: data.description,
				position: data.position,
				...(profileImageUrl && { profile_image_url: profileImageUrl }),
				...(symbolImageUrl && { election_symbol_url: symbolImageUrl }),
			};

			if (isEditing && initialData) {
				await updateCandidate({
					id: initialData.id,
					...candidateData,
				});
			} else {
				await createCandidate({
					...candidateData,
					election_id: electionId,
				});
			}

			// Clean up preview URLs
			if (profileImagePreview && profileImagePreview.startsWith("blob:")) {
				URL.revokeObjectURL(profileImagePreview);
			}
			if (symbolImagePreview && symbolImagePreview.startsWith("blob:")) {
				URL.revokeObjectURL(symbolImagePreview);
			}

			toast.success(
				isEditing
					? `✅ Candidate "${data.name}" updated successfully!`
					: `🎉 Candidate "${data.name}" added successfully!`,
				{ id: loadingToast, duration: 3000 },
			);

			onSuccess();
		} catch (err) {
			console.error("Failed to save candidate:", err);
			toast.error(
				`❌ Failed to ${isEditing ? "update" : "create"} candidate: ${err instanceof Error ? err.message : "Unknown error"}`,
				{ id: loadingToast, duration: 5000 },
			);
		}
	};

	const ImageUploadArea = ({
		type,
		currentUrl,
		onFileChange,
		icon: Icon,
		title,
		subtitle,
	}: {
		type: "profile" | "symbol";
		currentUrl: string | null;
		onFileChange: (file: File | null) => void;
		icon: any;
		title: string;
		subtitle: string;
	}) => {
		const handleClick = () => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "image/*";
			input.onchange = (e) => {
				const file = (e.target as HTMLInputElement).files?.[0];
				if (file) onFileChange(file);
			};
			input.click();
		};

		return (
			<div className="space-y-2">
				<Label className="text-sm font-medium flex items-center gap-1.5">
					<Icon className="h-4 w-4" />
					{title}
				</Label>

				<div
					className="relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 border-border hover:border-primary/60 hover:bg-muted/50 cursor-pointer"
					onClick={handleClick}
				>
					{currentUrl ? (
						<div className="relative">
							{type === "profile" ? (
								<Avatar className="h-24 w-24 mx-auto">
									<AvatarImage src={currentUrl} className="object-cover" />
									<AvatarFallback>
										<User className="h-10 w-10" />
									</AvatarFallback>
								</Avatar>
							) : (
								<div className="flex justify-center">
									<img src={currentUrl} alt="Election symbol" className="h-24 w-24 object-contain rounded-lg" />
								</div>
							)}
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="absolute -top-1 -right-1 h-7 w-7 rounded-full p-0 shadow-sm"
								onClick={(e) => {
									e.stopPropagation();
									onFileChange(null);
								}}
							>
								<X className="h-3.5 w-3.5" />
							</Button>
						</div>
					) : (
						<div className="text-center py-2">
							<Upload className="h-10 w-10 mx-auto text-muted-foreground" />
							<p className="mt-3 text-sm font-medium">Click to upload</p>
							<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="w-full p-6">
			<Card className="max-w-4xl mx-auto">
				<CardHeader className="pb-6">
					<CardTitle className="text-xl flex items-center gap-2">
						<UserCheck className="h-5 w-5" />
						{isEditing ? "Edit Candidate" : "Add Candidate"}
					</CardTitle>
				</CardHeader>

				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="space-y-6">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name" className="text-sm font-medium">
									Candidate Name *
								</Label>
								<Input
									id="name"
									{...register("name", { required: "Name is required" })}
									placeholder="Enter full name"
									disabled={isLoading}
									className="h-11"
								/>
								{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="position" className="text-sm font-medium flex items-center gap-1.5">
									<Hash className="h-4 w-4" />
									Position *
								</Label>
								<Input
									id="position"
									type="number"
									min="1"
									{...register("position", {
										required: "Position is required",
										min: { value: 1, message: "Position must be at least 1" },
									})}
									disabled={isLoading}
									className="h-11"
									placeholder={`Position ${getNextPosition()}`}
								/>
								{errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description" className="text-sm font-medium flex items-center gap-1.5">
								<FileText className="h-4 w-4" />
								Description
							</Label>
							<Textarea
								id="description"
								{...register("description")}
								placeholder="Brief candidate description or manifesto..."
								rows={3}
								disabled={isLoading}
								className="resize-none"
							/>
						</div>

						<div className="grid gap-6 md:grid-cols-2">
							<ImageUploadArea
								type="profile"
								currentUrl={profileImagePreview}
								onFileChange={handleProfileImageChange}
								icon={User}
								title="Profile Photo"
								subtitle="JPG, PNG up to 5MB"
							/>

							<ImageUploadArea
								type="symbol"
								currentUrl={symbolImagePreview}
								onFileChange={handleElectionSymbolChange}
								icon={Hash}
								title="Election Symbol"
								subtitle="Logo or symbol"
							/>
						</div>
					</CardContent>

					<div className="flex justify-end gap-3 p-6 pt-4">
						<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading || !watch("name")}>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{isEditing ? "Updating..." : "Creating..."}
								</>
							) : (
								<>{isEditing ? "Update" : "Add Candidate"}</>
							)}
						</Button>
					</div>
				</form>
			</Card>
		</div>
	);
}
