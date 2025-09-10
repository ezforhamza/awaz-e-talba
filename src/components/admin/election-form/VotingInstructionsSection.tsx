import { UseFormRegister } from "react-hook-form";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Settings } from "lucide-react";

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

interface VotingInstructionsSectionProps {
	register: UseFormRegister<ElectionFormData>;
	isLoading: boolean;
}

export function VotingInstructionsSection({ register, isLoading }: VotingInstructionsSectionProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 mb-4">
				<Settings className="h-5 w-5 text-primary" />
				<h3 className="text-lg font-semibold">Voting Instructions</h3>
			</div>

			<div className="space-y-3">
				<Label htmlFor="voting_instructions" className="text-base font-medium">
					Special Instructions for Voters
				</Label>
				<Textarea
					id="voting_instructions"
					{...register("voting_instructions")}
					placeholder="Add any special instructions, eligibility requirements, or voting guidelines..."
					rows={4}
					disabled={isLoading}
					className="text-base"
				/>
				<p className="text-sm text-muted-foreground">
					These instructions will be shown to voters before they cast their ballot
				</p>
			</div>
		</div>
	);
}
