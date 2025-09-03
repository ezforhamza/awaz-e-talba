import { Icon } from "@/components/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import type { ActivityItem } from '../types';

interface RecentActivityProps {
  activities: ActivityItem[];
  loading: boolean;
}

export function RecentActivity({ activities, loading }: RecentActivityProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vote_cast':
        return {
          icon: 'solar:check-square-bold',
          color: 'hsl(142 76% 50%)',
          bg: 'hsl(142 76% 95%)',
        };
      case 'election_created':
        return {
          icon: 'solar:add-square-bold',
          color: 'hsl(214 100% 50%)',
          bg: 'hsl(214 100% 95%)',
        };
      case 'election_started':
        return {
          icon: 'solar:play-circle-bold',
          color: 'hsl(25 95% 53%)',
          bg: 'hsl(25 95% 95%)',
        };
      case 'election_ended':
        return {
          icon: 'solar:stop-circle-bold',
          color: 'hsl(0 84% 50%)',
          bg: 'hsl(0 84% 95%)',
        };
      default:
        return {
          icon: 'solar:info-circle-bold',
          color: 'hsl(220 9% 50%)',
          bg: 'hsl(220 9% 95%)',
        };
    }
  };

  const getActivityTitle = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'vote_cast':
        return 'Vote Cast';
      case 'election_created':
        return 'Election Created';
      case 'election_started':
        return 'Election Started';
      case 'election_ended':
        return 'Election Ended';
      default:
        return 'Activity';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
            <Icon icon="solar:history-3-bold" className="w-5 h-5 text-purple-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Icon icon="solar:clock-circle-outline" className="w-16 h-16 mx-auto mb-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
              No Recent Activity
            </h3>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>
              Activity will appear here as users interact with the system
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
          <Icon icon="solar:history-3-bold" className="w-5 h-5 text-purple-600" />
          Recent Activity
          <div className="flex items-center gap-1 ml-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-purple-600">LIVE</span>
          </div>
        </CardTitle>
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Latest {activities.length} activities
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => {
            const iconData = getActivityIcon(activity.type);
            
            return (
              <div key={activity.id} className="relative">
                <div className="flex items-start gap-3">
                  {/* Activity Icon */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: iconData.bg }}
                  >
                    <Icon 
                      icon={iconData.icon} 
                      className="w-5 h-5"
                      style={{ color: iconData.color }}
                    />
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span 
                        className="text-sm font-medium" 
                        style={{ color: 'hsl(var(--foreground))' }}
                      >
                        {getActivityTitle(activity)}
                      </span>
                      <span 
                        className="text-xs" 
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    
                    <p 
                      className="text-sm mb-2" 
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      {activity.details}
                    </p>

                    {/* Activity Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {activity.election_title && (
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                        >
                          {activity.election_title}
                        </Badge>
                      )}
                      {activity.candidate_name && (
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: 'hsl(142 76% 95%)', 
                            color: 'hsl(142 76% 40%)' 
                          }}
                        >
                          {activity.candidate_name}
                        </Badge>
                      )}
                      {activity.student_name && (
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback 
                              className="text-xs"
                              style={{ 
                                backgroundColor: 'hsl(var(--muted))', 
                                color: 'hsl(var(--muted-foreground))' 
                              }}
                            >
                              {activity.student_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span 
                            className="text-xs" 
                            style={{ color: 'hsl(var(--muted-foreground))' }}
                          >
                            {activity.student_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection Line */}
                {index < activities.length - 1 && (
                  <div 
                    className="absolute left-5 top-12 bottom-0 w-px" 
                    style={{ backgroundColor: 'hsl(var(--border))' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}