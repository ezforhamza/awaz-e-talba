import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { BarChart3, Users, Calendar, TrendingUp } from "lucide-react";

interface ElectionStatsData {
	total: number;
	draft: number;
	active: number;
	completed: number;
	archived: number;
}

interface ElectionStatsProps {
	stats: ElectionStatsData | null;
	isLoading?: boolean;
}

const StatCard = ({
	title,
	value,
	description,
	icon: Icon,
	trend,
	color = "default",
}: {
	title: string;
	value: number;
	description: string;
	icon: any;
	trend?: "up" | "down" | "neutral";
	color?: "default" | "success" | "warning" | "danger";
}) => {
	const colorClasses = {
		default: "text-blue-600 bg-blue-50",
		success: "text-green-600 bg-green-50",
		warning: "text-yellow-600 bg-yellow-50",
		danger: "text-red-600 bg-red-50",
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<div className={`h-8 w-8 rounded-md flex items-center justify-center ${colorClasses[color]}`}>
					<Icon className="h-4 w-4" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-baseline space-x-2">
					<div className="text-2xl font-bold">{value}</div>
					{trend && (
						<div
							className={`flex items-center text-xs ${
								trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"
							}`}
						>
							<TrendingUp className="h-3 w-3 mr-1" />
							{trend}
						</div>
					)}
				</div>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	);
};

export function ElectionStats({ stats, isLoading }: ElectionStatsProps) {
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
							<div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
						</CardHeader>
						<CardContent>
							<div className="h-6 bg-gray-200 rounded animate-pulse w-12 mb-2"></div>
							<div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!stats) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center py-8">
						<BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-500">No election statistics available</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const statCards = [
		{
			title: "Total Elections",
			value: stats.total,
			description: "All elections created",
			icon: Calendar,
			color: "default" as const,
		},
		{
			title: "Active Elections",
			value: stats.active,
			description: "Currently running",
			icon: Users,
			color: "success" as const,
			trend: stats.active > 0 ? ("up" as const) : ("neutral" as const),
		},
		{
			title: "Draft Elections",
			value: stats.draft,
			description: "Not yet started",
			icon: BarChart3,
			color: "warning" as const,
		},
		{
			title: "Completed",
			value: stats.completed,
			description: "Finished elections",
			icon: TrendingUp,
			color: "default" as const,
		},
	];

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{statCards.map((stat, index) => (
					<StatCard key={index} {...stat} />
				))}
			</div>

			{/* Summary Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Election Overview</CardTitle>
					<CardDescription>Current status of your elections</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						{stats.active > 0 && (
							<Badge variant="default" className="bg-green-600">
								{stats.active} Active
							</Badge>
						)}
						{stats.draft > 0 && (
							<Badge variant="secondary">
								{stats.draft} Draft{stats.draft > 1 ? "s" : ""}
							</Badge>
						)}
						{stats.completed > 0 && <Badge variant="outline">{stats.completed} Completed</Badge>}
						{stats.archived > 0 && <Badge variant="outline">{stats.archived} Archived</Badge>}
					</div>

					{stats.active === 0 && stats.draft === 0 && (
						<p className="text-sm text-muted-foreground mt-4">
							No active or draft elections. Create a new election to get started.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
