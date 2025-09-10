import { StatsCard } from "./components/StatsCard";
import { LiveElectionCard } from "./components/LiveElectionCard";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { useOptimizedLiveElections } from "./hooks/useOptimizedLiveElections";
import { BarChart3, Users, Vote, UserCheck, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";

export default function Dashboard() {
	const { stats, loading: statsLoading } = useDashboardStats();
	const { elections, loading: electionsLoading } = useOptimizedLiveElections();
	const navigate = useNavigate();

	const handleEditElection = (electionId: string) => {
		navigate(`/dashboard/elections/${electionId}/edit`);
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto p-6 space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
						<p className="mt-2 text-muted-foreground">
							Welcome to Awaz-e-Talba - Live election monitoring and analytics
						</p>
					</div>

					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
						<span className="text-sm font-medium text-green-600">Real-time Updates</span>
					</div>
				</div>

				{/* Statistics Cards */}
				<section>
					<div className="flex items-center gap-2 mb-6">
						<BarChart3 className="w-6 h-6 text-blue-600" />
						<h2 className="text-2xl font-semibold text-foreground">Overview</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
						<StatsCard title="Total Elections" value={stats.totalElections} icon={BarChart3} loading={statsLoading} />
						<StatsCard title="Active Elections" value={stats.activeElections} icon={Vote} loading={statsLoading} />
						<StatsCard title="Total Votes" value={stats.totalVotes} icon={Vote} isLive loading={statsLoading} />
						<StatsCard title="Candidates" value={stats.totalCandidates} icon={UserCheck} loading={statsLoading} />
						<StatsCard title="Students" value={stats.totalStudents} icon={Users} loading={statsLoading} />
						<StatsCard
							title="Participation Rate"
							value={`${stats.participationRate}%`}
							icon={TrendingUp}
							loading={statsLoading}
						/>
					</div>
				</section>

				{/* Active Elections Section */}
				<section>
					<div className="flex items-center gap-2 mb-6">
						<Vote className="w-6 h-6 text-purple-600" />
						<h2 className="text-2xl font-semibold text-foreground">Active Elections</h2>
					</div>

					{electionsLoading ? (
						<div className="grid gap-6 lg:grid-cols-2">
							{[...Array(2)].map((_, i) => (
								<div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
							))}
						</div>
					) : elections.length > 0 ? (
						<div className="grid gap-6 lg:grid-cols-2">
							{elections.map((election) => (
								<LiveElectionCard
									key={election.id}
									election={election}
									showAdminActions={true}
									onEdit={handleEditElection}
								/>
							))}
						</div>
					) : (
						<div className="bg-card border rounded-lg p-16 text-center">
							<Vote className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-50" />
							<h3 className="text-xl font-semibold text-foreground mb-3">No Active Elections</h3>
							<p className="text-muted-foreground">Create and start an election to see live voting data here</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
