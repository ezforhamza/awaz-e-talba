import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Badge } from "@/ui/badge";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface Election {
	id: string;
	title: string;
	description?: string;
	category: string;
	status: "draft" | "active" | "completed" | "archived";
	start_date: string;
	end_date: string;
	candidates?: Array<{ id: string; name: string }>;
}

interface ElectionSelectorProps {
	elections: Election[];
	selectedElectionId: string | null;
	onElectionChange: (electionId: string | null) => void;
	isLoading?: boolean;
}

export function ElectionSelector({
	elections,
	selectedElectionId,
	onElectionChange,
	isLoading = false,
}: ElectionSelectorProps) {
	const selectedElection = elections.find((e) => e.id === selectedElectionId);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "draft":
				return "secondary";
			case "active":
				return "default";
			case "completed":
				return "outline";
			case "archived":
				return "destructive";
			default:
				return "secondary";
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<div className="animate-pulse space-y-2">
						<div className="h-5 bg-gray-200 rounded w-1/3"></div>
						<div className="h-4 bg-gray-200 rounded w-2/3"></div>
					</div>
				</CardHeader>
			</Card>
		);
	}

	return (
		<div className="mb-6">
			<Select value={selectedElectionId || ""} onValueChange={(value) => onElectionChange(value || null)}>
				<SelectTrigger className="w-full h-11 text-left">
					<SelectValue placeholder="Choose an election to manage candidates" />
				</SelectTrigger>
				<SelectContent>
					{elections.length === 0 ? (
						<div className="p-4 text-center text-muted-foreground text-sm">No elections available</div>
					) : (
						elections.map((election) => (
							<SelectItem key={election.id} value={election.id}>
								<div className="flex items-center gap-2 w-full">
									<span>{election.title}</span>
									<Badge variant={getStatusColor(election.status)} className="text-xs">
										{election.status}
									</Badge>
								</div>
							</SelectItem>
						))
					)}
				</SelectContent>
			</Select>
		</div>
	);
}
