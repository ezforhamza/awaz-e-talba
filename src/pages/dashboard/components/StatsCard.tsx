import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	trend?: {
		value: string;
		isPositive: boolean;
	};
	isLive?: boolean;
	loading?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, isLive = false, loading = false }: StatsCardProps) {
	if (loading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="animate-pulse">
						<div className="h-4 bg-muted rounded w-24 mb-3"></div>
						<div className="h-8 bg-muted rounded w-16 mb-2"></div>
						<div className="h-3 bg-muted rounded w-20"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="relative overflow-hidden">
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<p className="text-sm font-medium text-muted-foreground">{title}</p>
							{isLive && (
								<Badge variant="secondary" className="text-xs">
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
									LIVE
								</Badge>
							)}
						</div>
						<p className="text-3xl font-bold text-foreground">{value}</p>
						{trend && (
							<p className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"} mt-1`}>
								{trend.isPositive ? "↗" : "↘"} {trend.value}
							</p>
						)}
					</div>
					<div className="p-3 bg-primary/10 rounded-lg">
						<Icon className="w-6 h-6 text-primary" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
