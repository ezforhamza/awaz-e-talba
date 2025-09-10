import { useState } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Alert, AlertDescription } from "@/ui/alert";
import { User, Shield, Info, Loader2 } from "lucide-react";

interface VotingIdStepProps {
	onVerify: (id: string) => void;
	isVerifying: boolean;
	error?: string;
}

export function VotingIdStep({ onVerify, isVerifying, error }: VotingIdStepProps) {
	const [votingId, setVotingId] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("🔍 Form submitted with voting ID:", votingId);
		if (votingId.trim()) {
			const cleanId = votingId.trim().toUpperCase();
			console.log("🔍 Calling onVerify with:", cleanId);
			onVerify(cleanId);
		} else {
			console.error("❌ Empty voting ID");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-6">
			<Card className="w-full max-w-lg shadow-2xl bg-card/95 backdrop-blur-sm">
				<CardHeader className="text-center pb-6">
					<div className="flex justify-center mb-6">
						<div className="p-4 bg-primary/10 rounded-full shadow-lg">
							{isVerifying ? (
								<Loader2 className="w-12 h-12 text-primary animate-spin" />
							) : (
								<User className="w-12 h-12 text-primary" />
							)}
						</div>
					</div>
					<CardTitle className="text-3xl font-bold text-foreground">Enter Voting ID</CardTitle>
					<p className="text-muted-foreground text-base mt-2">
						Enter your unique voting ID to access all available elections
					</p>
				</CardHeader>

				<CardContent className="pt-0">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-4">
							<Input
								type="text"
								placeholder="Enter your voting ID (e.g., VROLL0016469)"
								value={votingId}
								onChange={(e) => setVotingId(e.target.value.toUpperCase())}
								className="text-center text-xl font-mono tracking-wider h-14 rounded-xl transition-all duration-200"
								disabled={isVerifying}
								autoFocus
							/>
							{error && (
								<Alert variant="destructive">
									<Info className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
						</div>

						<Button
							type="submit"
							className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
							disabled={!votingId.trim() || isVerifying}
						>
							{isVerifying && <Loader2 className="w-6 h-6 mr-3 animate-spin" />}
							{isVerifying ? "Verifying..." : "Continue to Elections"}
						</Button>
					</form>

					<div className="mt-8 pt-6 border-t">
						<div className="text-center space-y-3">
							<p className="text-sm text-muted-foreground">Need help? Contact election administrator</p>
							<div className="flex justify-center items-center gap-2 text-primary">
								<Shield className="w-5 h-5" />
								<span className="text-sm font-medium">Secure & Anonymous Voting</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
