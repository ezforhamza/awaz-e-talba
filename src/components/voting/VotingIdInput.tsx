import { useState } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Label } from "@/ui/label";
import { Alert, AlertDescription } from "@/ui/alert";
import { Loader2, Vote } from "lucide-react";

interface VotingIdInputProps {
	onSubmit: (votingId: string) => Promise<void>;
	isLoading?: boolean;
	error?: string | null;
}

export function VotingIdInput({ onSubmit, isLoading = false, error }: VotingIdInputProps) {
	const [votingId, setVotingId] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (votingId.trim()) {
			await onSubmit(votingId.trim());
		}
	};

	const formatVotingId = (value: string) => {
		// Auto-format to VT2024-XXXX-YYYY pattern
		const cleaned = value.replace(/[^A-Z0-9]/g, "").toUpperCase();
		if (cleaned.startsWith("VT2024")) {
			const rest = cleaned.slice(6);
			if (rest.length <= 4) {
				return `VT2024-${rest}`;
			} else if (rest.length <= 8) {
				return `VT2024-${rest.slice(0, 4)}-${rest.slice(4)}`;
			}
			return `VT2024-${rest.slice(0, 4)}-${rest.slice(4, 8)}`;
		}
		return cleaned;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatVotingId(e.target.value);
		setVotingId(formatted);
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
						<Vote className="h-6 w-6 text-blue-600" />
					</div>
					<CardTitle className="text-2xl font-bold">Awaz-e-Talba</CardTitle>
					<CardDescription>Enter your voting ID to access your ballot</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="votingId">Voting ID</Label>
							<Input
								id="votingId"
								type="text"
								placeholder="VT2024-XXXX-YYYY"
								value={votingId}
								onChange={handleInputChange}
								disabled={isLoading}
								className="text-center font-mono"
								maxLength={15}
							/>
							<p className="text-xs text-muted-foreground text-center">Format: VT2024-XXXX-YYYY</p>
						</div>

						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<Button type="submit" className="w-full" disabled={isLoading || votingId.length < 10}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Verifying...
								</>
							) : (
								"Start Voting"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
