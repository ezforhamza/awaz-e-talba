import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Activity, Vote, UserPlus, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
	id: string;
	type: "vote_cast" | "election_started" | "election_ended" | "student_registered";
	description: string;
	timestamp: string;
	metadata?: {
		election_title?: string;
		student_name?: string;
		candidate_name?: string;
	};
}

interface RecentActivityFeedProps {
	activities: ActivityItem[];
	loading?: boolean;
}

const getActivityIcon = (type: string) => {
	switch (type) {
		case "vote_cast":
			return Vote;
		case "student_registered":
			return UserPlus;
		case "election_started":
		case "election_ended":
			return Settings;
		default:
			return Activity;
	}
};

const getActivityColor = (type: string) => {
	switch (type) {
		case "vote_cast":
			return "text-green-600 bg-green-100";
		case "student_registered":
			return "text-blue-600 bg-blue-100";
		case "election_started":
			return "text-purple-600 bg-purple-100";
		case "election_ended":
			return "text-orange-600 bg-orange-100";
		default:
			return "text-gray-600 bg-gray-100";
	}
};

export function RecentActivityFeed({ activities, loading = false }: RecentActivityFeedProps) {
	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="w-5 h-5" />
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="flex items-center gap-3 animate-pulse">
								<div className="w-8 h-8 bg-muted rounded-full"></div>
								<div className="flex-1 space-y-1">
									<div className="h-3 bg-muted rounded w-full"></div>
									<div className="h-2 bg-muted rounded w-1/2"></div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="w-5 h-5" />
					Recent Activity
				</CardTitle>
			</CardHeader>
			<CardContent>
				{activities.length > 0 ? (
					<div className="space-y-4">
						{activities.map((activity) => {
							const Icon = getActivityIcon(activity.type);
							const colorClasses = getActivityColor(activity.type);

							return (
								<div key={activity.id} className="flex items-start gap-3">
									<Avatar className={`w-8 h-8 ${colorClasses}`}>
										<AvatarFallback className={colorClasses}>
											<Icon className="w-4 h-4" />
										</AvatarFallback>
									</Avatar>

									<div className="flex-1 min-w-0">
										<p className="text-sm text-foreground">{activity.description}</p>
										<div className="flex items-center gap-2 mt-1">
											<p className="text-xs text-muted-foreground">
												{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
											</p>
											{activity.metadata?.election_title && (
												<Badge variant="outline" className="text-xs">
													{activity.metadata.election_title}
												</Badge>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
						<p className="font-medium">No Recent Activity</p>
						<p className="text-sm">Activity will appear here as users interact with the system</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
