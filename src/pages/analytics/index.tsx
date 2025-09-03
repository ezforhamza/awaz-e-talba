import { Icon } from "@/components/icon";
import { useVotingAnalytics } from "@/hooks/useVotes";
import { useElections } from "@/hooks/useElections";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Progress } from "@/ui/progress";
import { useState } from "react";
import { toast } from "sonner";

export default function Analytics() {
  const { analytics, isLoading, refetch } = useVotingAnalytics();
  const { elections } = useElections();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Analytics refreshed!");
  };

  const getElectionsByStatus = (status: string) => {
    return elections.filter(election => election.status === status);
  };

  const formatTrendData = () => {
    if (!analytics?.votingTrend) return [];
    
    // Ensure we have data for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dateStr);
    }
    
    return last7Days.map(date => {
      const dayData = analytics.votingTrend.find(d => d.date === date);
      return {
        date,
        votes: dayData ? dayData.votes : 0,
        dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Icon icon="solar:refresh-outline" className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  const trendData = formatTrendData();
  const maxVotes = Math.max(...trendData.map(d => d.votes), 1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <Icon icon="solar:graph-outline" className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time voting analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <Icon icon="solar:refresh-outline" className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            <Icon icon="solar:pulse-outline" className="w-3 h-3 mr-1 text-green-500" />
            Live Updates
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon icon="solar:chart-square-outline" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalVotes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Icon icon="solar:play-circle-outline" className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Elections</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.activeElections || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Icon icon="solar:users-group-rounded-outline" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalStudents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Icon icon="solar:target-outline" className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Participation Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.participationRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voting Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:chart-outline" className="w-5 h-5" />
            Voting Activity (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.every(d => d.votes === 0) ? (
            <div className="text-center py-12">
              <Icon icon="solar:chart-outline" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No Voting Activity</h3>
              <p className="text-muted-foreground">
                No votes have been cast in the last 7 days
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {trendData.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="h-32 flex flex-col justify-end items-center">
                      <div 
                        className="w-8 bg-blue-500 dark:bg-blue-400 rounded-t-sm transition-all duration-300"
                        style={{ 
                          height: `${Math.max((day.votes / maxVotes) * 100, 2)}%`,
                          minHeight: day.votes > 0 ? '8px' : '2px'
                        }}
                      />
                      <div className="mt-2 text-xs font-medium text-gray-900 dark:text-white">{day.votes}</div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">{day.dayName}</div>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Daily vote counts over the past week
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Election Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:list-check-outline" className="w-5 h-5" />
            Election Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Draft</span>
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  {getElectionsByStatus('draft').length}
                </Badge>
              </div>
              <Progress value={elections.length > 0 ? (getElectionsByStatus('draft').length / elections.length) * 100 : 0} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Active</span>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  {getElectionsByStatus('active').length}
                </Badge>
              </div>
              <Progress value={elections.length > 0 ? (getElectionsByStatus('active').length / elections.length) * 100 : 0} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Completed</span>
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {getElectionsByStatus('completed').length}
                </Badge>
              </div>
              <Progress value={elections.length > 0 ? (getElectionsByStatus('completed').length / elections.length) * 100 : 0} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Cancelled</span>
                <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                  {getElectionsByStatus('cancelled').length}
                </Badge>
              </div>
              <Progress value={elections.length > 0 ? (getElectionsByStatus('cancelled').length / elections.length) * 100 : 0} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participation Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:user-check-outline" className="w-5 h-5" />
            Participation Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {analytics?.totalVotes || 0}
                </div>
                <div className="text-sm text-muted-foreground">Votes Cast</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {analytics?.totalStudents || 0}
                </div>
                <div className="text-sm text-muted-foreground">Eligible Voters</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {analytics?.participationRate || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Participation Rate</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-900 dark:text-white">Overall Participation</span>
                <span className="font-medium text-gray-900 dark:text-white">{analytics?.participationRate || 0}%</span>
              </div>
              <Progress value={analytics?.participationRate || 0} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {analytics?.totalVotes || 0} out of {analytics?.totalStudents || 0} eligible students have voted
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}