import { Icon } from "@/components/icon";
import { Card, CardContent } from "@/ui/card";
import type { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const statsData = [
    {
      title: "Total Elections",
      value: stats.totalElections,
      icon: "solar:ballot-bold",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10",
      iconBg: "hsl(214 100% 50%)",
    },
    {
      title: "Active Elections",
      value: stats.activeElections,
      icon: "solar:play-circle-bold",
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-600/10",
      iconBg: "hsl(142 76% 50%)",
    },
    {
      title: "Total Votes",
      value: stats.totalVotes,
      icon: "solar:check-square-bold",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/10",
      iconBg: "hsl(276 100% 50%)",
    },
    {
      title: "Candidates",
      value: stats.totalCandidates,
      icon: "solar:users-group-rounded-bold",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/10",
      iconBg: "hsl(25 95% 53%)",
    },
    {
      title: "Students",
      value: stats.totalStudents,
      icon: "solar:user-bold",
      gradient: "from-cyan-500 to-cyan-600",
      bgGradient: "from-cyan-500/10 to-cyan-600/10",
      iconBg: "hsl(188 94% 50%)",
    },
    {
      title: "Participation Rate",
      value: `${stats.participationRate}%`,
      icon: "solar:chart-square-bold",
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-500/10 to-pink-600/10",
      iconBg: "hsl(330 81% 50%)",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse"></div>
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
          <CardContent className="p-0">
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient}`} />
            
            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: stat.iconBg }}
                >
                  <Icon icon={stat.icon} className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <p 
                    className="text-sm font-medium mb-1" 
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    {stat.title}
                  </p>
                  <p 
                    className="text-3xl font-bold" 
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div 
                className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10"
                style={{ background: `linear-gradient(135deg, ${stat.iconBg}, transparent)` }}
              />
              <div 
                className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full opacity-5"
                style={{ background: `linear-gradient(135deg, ${stat.iconBg}, transparent)` }}
              />
            </div>
            
            {/* Live indicator for active stats */}
            {(stat.title === "Active Elections" || stat.title === "Total Votes") && stats.activeElections > 0 && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-600">LIVE</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}