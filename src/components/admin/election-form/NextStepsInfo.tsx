import { Card, CardContent } from "@/ui/card";
import { Users } from "lucide-react";

interface NextStepsInfoProps {
	isEditing: boolean;
}

export function NextStepsInfo({ isEditing }: NextStepsInfoProps) {
	if (isEditing) return null;

	return (
		<Card className="mt-6 border-dashed">
			<CardContent className="pt-6">
				<div className="text-center space-y-3">
					<div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mx-auto">
						<Users className="h-5 w-5 text-green-600" />
					</div>
					<h3 className="font-semibold text-base">Next: Add Candidates</h3>
					<p className="text-sm text-muted-foreground max-w-md mx-auto">
						After creating your election, you'll be able to add candidates with their photos and election symbols in the
						Candidates section.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
