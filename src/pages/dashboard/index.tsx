import { Icon } from "@/components/icon";
import { useDashboardData, useLiveElections, useRecentActivity } from './hooks/useDashboardData';
import {
  StatsCards,
  LiveElectionCharts,
  ActiveElectionsList,
  RecentActivity
} from './components';

export default function Dashboard() {
  const { stats, loading: statsLoading } = useDashboardData();
  const { elections, loading: electionsLoading } = useLiveElections();
  const { activities, loading: activitiesLoading } = useRecentActivity();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
              Dashboard
            </h1>
            <p className="mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Welcome to Awaz-e-Talba - Live election monitoring and analytics
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-600">
              Real-time Updates
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Icon icon="solar:chart-square-bold" className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Overview
            </h2>
          </div>
          <StatsCards stats={stats} loading={statsLoading} />
        </section>

        {/* Live Charts Section */}
        {(elections.length > 0 || electionsLoading) && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Icon icon="solar:chart-2-bold" className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                Live Election Charts
              </h2>
            </div>
            <LiveElectionCharts elections={elections} loading={electionsLoading} />
          </section>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Active Elections List */}
          <div className="xl:col-span-2">
            <ActiveElectionsList elections={elections} loading={electionsLoading} />
          </div>

          {/* Recent Activity Feed */}
          <div className="xl:col-span-1">
            <RecentActivity activities={activities} loading={activitiesLoading} />
          </div>
        </div>

      </div>
    </div>
  );
}