import { Icon } from "@/components/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Text, Title } from "@/ui/typography";

const quickStats = [
	{
		icon: "solar:notebook-outline",
		label: "Total Feedback",
		value: "24",
		color: "#3b82f6",
	},
	{
		icon: "solar:users-group-two-rounded-outline",
		label: "Active Students",
		value: "156",
		color: "#10b981",
	},
	{
		icon: "solar:chat-round-outline",
		label: "Open Issues",
		value: "8",
		color: "#f59e0b",
	},
	{
		icon: "solar:check-circle-outline",
		label: "Resolved",
		value: "16",
		color: "#06d6a0",
	},
];

const recentFeedback = [
	{
		id: 1,
		title: "Library Wi-Fi Issues",
		category: "Infrastructure",
		status: "pending",
		priority: "high",
		date: "2024-01-15",
		student: "Student A"
	},
	{
		id: 2,
		title: "Cafeteria Food Quality",
		category: "Food Services",
		status: "in-progress",
		priority: "medium",
		date: "2024-01-14",
		student: "Student B"
	},
	{
		id: 3,
		title: "Classroom Temperature",
		category: "Infrastructure",
		status: "resolved",
		priority: "low",
		date: "2024-01-13",
		student: "Student C"
	},
];

export default function Workbench() {
	return (
		<div className="p-6 space-y-6">
			{/* Welcome Section */}
			<div className="mb-8">
				<Title as="h2" className="mb-2">
					Welcome to {GLOBAL_CONFIG.appName}
				</Title>
				<Text variant="body1" className="text-muted-foreground">
					Student Voice Platform - Empowering student participation and democratic processes
				</Text>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{quickStats.map((stat) => (
					<Card key={stat.label} className="relative">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<Text variant="body2" className="text-muted-foreground mb-1">
										{stat.label}
									</Text>
									<Title as="h3" className="font-bold">
										{stat.value}
									</Title>
								</div>
								<div 
									className="p-3 rounded-lg"
									style={{ backgroundColor: `${stat.color}20` }}
								>
									<Icon 
										icon={stat.icon} 
										size={24} 
										style={{ color: stat.color }}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Activity */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<Title as="h4">Recent Activity</Title>
						<Button variant="outline" size="sm">
							View All
						</Button>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentFeedback.map((feedback) => (
								<div key={feedback.id} className="flex items-center justify-between p-4 border rounded-lg">
									<div className="space-y-1">
										<Text variant="body1" className="font-medium">
											{feedback.title}
										</Text>
										<div className="flex items-center gap-2">
											<span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
												{feedback.category}
											</span>
											<span className={`text-xs px-2 py-1 rounded ${
												feedback.status === 'resolved' ? 'bg-green-100 text-green-800' :
												feedback.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
												'bg-gray-100 text-gray-800'
											}`}>
												{feedback.status}
											</span>
										</div>
									</div>
									<Text variant="caption" className="text-muted-foreground">
										{feedback.date}
									</Text>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<Title as="h4">Quick Actions</Title>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-3">
							<Button className="justify-start h-12" variant="outline">
								<Icon icon="solar:users-group-two-rounded-outline" size={20} />
								Manage Students
							</Button>
							<Button className="justify-start h-12" variant="outline">
								<Icon icon="solar:ballot-outline" size={20} />
								Create Election
							</Button>
							<Button className="justify-start h-12" variant="outline">
								<Icon icon="solar:chart-outline" size={20} />
								View Analytics
							</Button>
							<Button className="justify-start h-12" variant="outline">
								<Icon icon="solar:settings-outline" size={20} />
								Platform Settings
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
