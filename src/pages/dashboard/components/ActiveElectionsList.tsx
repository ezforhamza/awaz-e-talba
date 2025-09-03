import { Icon } from "@/components/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Progress } from "@/ui/progress";
import type { LiveElectionData } from '../types';

interface ActiveElectionsListProps {
  elections: LiveElectionData[];
  loading: boolean;
}

export function ActiveElectionsList({ elections, loading }: ActiveElectionsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (elections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
            <Icon icon="solar:play-circle-bold" className="w-5 h-5 text-emerald-600" />
            Active Elections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Icon icon="solar:inbox-outline" className="w-16 h-16 mx-auto mb-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
              No Active Elections
            </h3>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>
              Create and start an election to see live voting data here
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
          <Icon icon="solar:play-circle-bold" className="w-5 h-5 text-emerald-600" />
          Active Elections
          <div className="flex items-center gap-1 ml-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-600">LIVE</span>
          </div>
        </CardTitle>
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {elections.length} election{elections.length === 1 ? '' : 's'} currently running
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {elections.map((election) => {
            const topCandidate = election.vote_counts[0];
            const isClose = election.vote_counts.length > 1 && 
              election.vote_counts[0]?.vote_count - election.vote_counts[1]?.vote_count <= 2;

            return (
              <div key={election.id} className="relative">
                <div 
                  className="p-6 rounded-xl border transition-all duration-200 hover:shadow-md"
                  style={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                >
                  {/* Election Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1" style={{ color: 'hsl(var(--foreground))' }}>
                        {election.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        <span>Started: {formatDate(election.start_date)}</span>
                        <span>•</span>
                        <span>Ends: {formatDate(election.end_date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isClose && (
                        <Badge style={{ backgroundColor: 'hsl(25 95% 53%)', color: 'white' }}>
                          Close Race
                        </Badge>
                      )}
                      <Badge style={{ backgroundColor: 'hsl(142 76% 50%)', color: 'white' }}>
                        Active
                      </Badge>
                    </div>
                  </div>

                  {/* Election Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                      <div className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                        {election.total_votes.toLocaleString()}
                      </div>
                      <div className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Total Votes
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                      <div className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                        {election.participation_rate}%
                      </div>
                      <div className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Participation
                      </div>
                    </div>
                  </div>

                  {/* Leading Candidates */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Leading Candidates:
                    </h4>
                    {election.vote_counts.slice(0, 3).map((candidate, index) => (
                      <div key={candidate.candidate_id} className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            backgroundColor: index === 0 ? 'hsl(142 76% 50%)' : 
                                           index === 1 ? 'hsl(214 100% 50%)' : 
                                           'hsl(25 95% 53%)'
                          }}
                        >
                          {index + 1}
                        </div>
                        
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={candidate.candidate_image_url || ''} />
                          <AvatarFallback 
                            className="text-xs"
                            style={{ 
                              backgroundColor: 'hsl(var(--muted))', 
                              color: 'hsl(var(--muted-foreground))' 
                            }}
                          >
                            {candidate.candidate_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span 
                              className="font-medium text-sm truncate" 
                              style={{ color: 'hsl(var(--foreground))' }}
                            >
                              {candidate.candidate_name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-sm font-medium" 
                                style={{ color: 'hsl(var(--foreground))' }}
                              >
                                {candidate.vote_count}
                              </span>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                {candidate.percentage}%
                              </Badge>
                            </div>
                          </div>
                          <Progress 
                            value={candidate.percentage} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {election.vote_counts.length > 3 && (
                      <p 
                        className="text-xs text-center pt-2" 
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        +{election.vote_counts.length - 3} more candidates
                      </p>
                    )}
                  </div>
                </div>

                {/* Live indicator */}
                <div className="absolute -top-1 -right-1">
                  <div 
                    className="w-4 h-4 rounded-full animate-pulse"
                    style={{ backgroundColor: 'hsl(142 76% 50%)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}