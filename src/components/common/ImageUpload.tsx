import { useState, useRef } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Label } from "@/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
	value?: string | null;
	onChange: (file: File | null) => void;
	onRemove?: () => void;
	label?: string;
	description?: string;
	accept?: string;
	maxSizeMB?: number;
	className?: string;
	variant?: "avatar" | "card" | "symbol";
	disabled?: boolean;
	isUploading?: boolean;
}

export function ImageUpload({
	value,
	onChange,
	onRemove,
	label,
	description,
	accept = "image/*",
	maxSizeMB = 5,
	className = "",
	variant = "card",
	disabled = false,
	isUploading = false,
}: ImageUploadProps) {
	const [dragActive, setDragActive] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const validateFile = (file: File): string | null => {
		if (file.size > maxSizeMB * 1024 * 1024) {
			return `File size must be less than ${maxSizeMB}MB`;
		}
		if (!file.type.startsWith("image/")) {
			return "File must be an image";
		}
		return null;
	};

	const handleFileChange = (file: File) => {
		const validationError = validateFile(file);
		if (validationError) {
			setError(validationError);
			return;
		}
		setError(null);
		onChange(file);
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (disabled || isUploading) return;

		const files = e.dataTransfer.files;
		if (files && files[0]) {
			handleFileChange(files[0]);
		}
	};

	const handleClick = () => {
		if (disabled || isUploading) return;
		fileInputRef.current?.click();
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onRemove) {
			onRemove();
		} else {
			onChange(null);
		}
		setError(null);
	};

	if (variant === "avatar") {
		return (
			<div className={`space-y-2 ${className}`}>
				{label && <Label>{label}</Label>}
				<div className="flex items-center gap-4">
					<Avatar className="h-16 w-16">
						<AvatarImage src={value || undefined} />
						<AvatarFallback>
							<ImageIcon className="h-6 w-6" />
						</AvatarFallback>
					</Avatar>
					<div className="space-y-2">
						<Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={disabled || isUploading}>
							{isUploading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<Upload className="h-4 w-4 mr-2" />
									Upload
								</>
							)}
						</Button>
						{value && (
							<Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={disabled || isUploading}>
								Remove
							</Button>
						)}
					</div>
				</div>
				{description && <p className="text-xs text-muted-foreground">{description}</p>}
				{error && <p className="text-xs text-destructive">{error}</p>}
				<input
					ref={fileInputRef}
					type="file"
					accept={accept}
					onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
					className="hidden"
				/>
			</div>
		);
	}

	return (
		<div className={`space-y-2 ${className}`}>
			{label && <Label>{label}</Label>}
			<Card
				className={`
          cursor-pointer border-2 border-dashed transition-colors
          ${dragActive ? "border-primary bg-primary/5" : "border-muted"}
          ${disabled || isUploading ? "cursor-not-allowed opacity-60" : "hover:border-primary hover:bg-accent/50"}
        `}
				onClick={handleClick}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
			>
				<CardContent className="p-6">
					{value ? (
						<div className="relative">
							<img src={value} alt="Upload preview" className="mx-auto max-h-32 rounded object-contain" />
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
								onClick={handleRemove}
								disabled={disabled || isUploading}
							>
								<X className="h-3 w-3" />
							</Button>
						</div>
					) : (
						<div className="text-center">
							{isUploading ? (
								<Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
							) : (
								<Upload className="mx-auto h-8 w-8 text-muted-foreground" />
							)}
							<p className="mt-2 text-sm text-muted-foreground">
								{isUploading ? "Uploading..." : "Click or drag to upload"}
							</p>
							{description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
						</div>
					)}
				</CardContent>
			</Card>
			{error && <p className="text-xs text-destructive">{error}</p>}
			<input
				ref={fileInputRef}
				type="file"
				accept={accept}
				onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
				className="hidden"
			/>
		</div>
	);
}
