import { Icon } from "@/components/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Chart } from "@/components/chart";
import type { LiveElectionData } from '../types';

interface LiveElectionChartsProps {
  elections: LiveElectionData[];
  loading: boolean;
}

export function LiveElectionCharts({ elections, loading }: LiveElectionChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (elections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Icon icon="solar:chart-outline" className="w-16 h-16 mb-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
            No Active Elections
          </h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            Start an election to see live voting data and charts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {elections.map((election) => (
        <div key={election.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
                    <Icon icon="solar:pie-chart-2-bold" className="w-5 h-5 text-blue-600" />
                    Vote Distribution
                  </CardTitle>
                  <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {election.title}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-600">LIVE</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {election.vote_counts.length > 0 ? (
                <Chart
                  type="pie"
                  series={election.vote_counts.map(candidate => candidate.vote_count)}
                  options={{
                    chart: {
                      type: 'pie',
                    },
                    labels: election.vote_counts.map(candidate => candidate.candidate_name),
                    colors: [
                      '#10b981', // emerald
                      '#3b82f6', // blue
                      '#f59e0b', // amber
                      '#ef4444', // red
                      '#8b5cf6', // violet
                      '#06b6d4', // cyan
                    ],
                    legend: {
                      position: 'bottom',
                      horizontalAlign: 'center',
                    },
                    tooltip: {
                      y: {
                        formatter: (value: number) => `${value} votes`,
                      },
                    },
                    dataLabels: {
                      enabled: true,
                      formatter: (val: number) => `${Math.round(val)}%`,
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          size: '0%',
                        },
                      },
                    },
                  }}
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <Icon icon="solar:inbox-outline" className="w-12 h-12 mb-2 mx-auto" style={{ color: 'hsl(var(--muted-foreground))' }} />
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>No votes yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
                <Icon icon="solar:chart-2-bold" className="w-5 h-5 text-purple-600" />
                Vote Count Comparison
              </CardTitle>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Total: {election.total_votes.toLocaleString()} votes
                </p>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {election.participation_rate}% participation
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {election.vote_counts.length > 0 ? (
                <Chart
                  type="bar"
                  series={[
                    {
                      name: 'Votes',
                      data: election.vote_counts.map(candidate => candidate.vote_count),
                      color: '#3b82f6',
                    }
                  ]}
                  options={{
                    chart: {
                      type: 'bar',
                      horizontal: true,
                    },
                    xaxis: {
                      categories: election.vote_counts.map(candidate => 
                        candidate.candidate_name.length > 20 
                          ? candidate.candidate_name.substring(0, 20) + '...'
                          : candidate.candidate_name
                      ),
                    },
                    plotOptions: {
                      bar: {
                        borderRadius: 8,
                        distributed: true,
                        colors: {
                          backgroundBarColors: ['#f3f4f6'],
                          backgroundBarRadius: 8,
                        },
                      },
                    },
                    colors: [
                      '#10b981', // emerald for winner
                      '#3b82f6', // blue
                      '#f59e0b', // amber
                      '#ef4444', // red
                      '#8b5cf6', // violet
                      '#06b6d4', // cyan
                    ],
                    dataLabels: {
                      enabled: true,
                      formatter: (val: number) => `${val}`,
                    },
                    tooltip: {
                      y: {
                        formatter: (value: number, { dataPointIndex }) => {
                          const percentage = election.vote_counts[dataPointIndex]?.percentage || 0;
                          return `${value} votes (${percentage}%)`;
                        },
                      },
                    },
                    legend: {
                      show: false,
                    },
                  }}
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <Icon icon="solar:inbox-outline" className="w-12 h-12 mb-2 mx-auto" style={{ color: 'hsl(var(--muted-foreground))' }} />
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>No votes yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}