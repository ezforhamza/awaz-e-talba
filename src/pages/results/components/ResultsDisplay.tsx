import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Progress } from "@/ui/progress";
import type { ElectionResults } from '../types';
import { isDrawCondition } from '../utils';

interface ResultsDisplayProps {
  results: ElectionResults;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const isDraw = isDrawCondition(results);

  if (results.vote_counts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
            <Icon icon="solar:chart-square-outline" className="w-5 h-5 text-blue-600" />
            Vote Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Icon icon="solar:chart-outline" className="w-16 h-16 mx-auto mb-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>No Votes Yet</h3>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>
              Votes will appear here as they are cast
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
          <Icon icon="solar:chart-square-outline" className="w-5 h-5 text-blue-600" />
          Vote Results
          {isDraw && results.total_votes > 0 && (
            <Badge style={{ backgroundColor: 'hsl(33 100% 50%)', color: 'white' }}>Draw</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.vote_counts.map((candidate, index) => {
            const isWinner = index === 0 && results.total_votes > 0;
            const isDrawCandidate = isDraw && candidate.vote_count === results.vote_counts[0]?.vote_count;
            
            return (
              <div 
                key={candidate.candidate_id}
                className="relative overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md"
                style={{
                  borderColor: 'hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                }}
              >
                {/* Background gradient for winner/draw */}
                {isDrawCandidate && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5"></div>
                )}
                {isWinner && !isDraw && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5"></div>
                )}
                
                {/* Top accent bar */}
                {isDrawCandidate && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                )}
                {isWinner && !isDraw && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
                )}
                
                <div className="relative p-5">
                  <div className="flex items-center gap-4">
                    {/* Ranking badge */}
                    <div className="relative">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                        style={{
                          backgroundColor: isDrawCandidate 
                            ? 'hsl(45 93% 47%)'
                            : isWinner 
                            ? 'hsl(142 76% 50%)'
                            : 'hsl(220 9% 60%)',
                          color: 'white'
                        }}
                      >
                        {isDrawCandidate ? (
                          <Icon icon="solar:medal-star-bold" className="w-5 h-5" />
                        ) : isWinner ? (
                          <Icon icon="solar:crown-bold" className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      {/* Ring effect for top candidates */}
                      {(isWinner || isDrawCandidate) && (
                        <div 
                          className="absolute -inset-1 rounded-full animate-pulse"
                          style={{
                            background: isDrawCandidate 
                              ? 'linear-gradient(45deg, hsl(45 93% 47% / 0.3), hsl(45 93% 70% / 0.3))' 
                              : 'linear-gradient(45deg, hsl(142 76% 50% / 0.3), hsl(142 76% 70% / 0.3))',
                            zIndex: -1
                          }}
                        ></div>
                      )}
                    </div>
                    
                    {/* Avatar */}
                    <Avatar className="h-14 w-14 border-2 shadow-sm" style={{ borderColor: 'hsl(var(--border))' }}>
                      <AvatarImage src={candidate.candidate_image_url || ''} />
                      <AvatarFallback 
                        className="text-lg font-semibold"
                        style={{
                          backgroundColor: 'hsl(var(--muted))',
                          color: 'hsl(var(--muted-foreground))'
                        }}
                      >
                        {candidate.candidate_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Candidate info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 
                            className="font-semibold text-lg truncate" 
                            style={{ color: 'hsl(var(--foreground))' }}
                          >
                            {candidate.candidate_name}
                          </h3>
                          {(isWinner || isDrawCandidate) && (
                            <p className="text-sm font-medium" style={{ 
                              color: isDrawCandidate ? 'hsl(45 93% 47%)' : 'hsl(142 76% 50%)' 
                            }}>
                              {isDrawCandidate ? 'Tied for first' : 'Leading'}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right">
                            <div 
                              className="text-2xl font-bold" 
                              style={{ color: 'hsl(var(--foreground))' }}
                            >
                              {candidate.vote_count}
                            </div>
                            <div 
                              className="text-sm font-medium" 
                              style={{ color: 'hsl(var(--muted-foreground))' }}
                            >
                              {candidate.percentage}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="relative">
                        <div 
                          className="h-3 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'hsl(var(--muted))' }}
                        >
                          <div 
                            className="h-full transition-all duration-500 ease-out rounded-full"
                            style={{
                              width: `${candidate.percentage}%`,
                              background: isDrawCandidate 
                                ? 'linear-gradient(90deg, hsl(45 93% 47%), hsl(45 93% 60%))' 
                                : isWinner 
                                ? 'linear-gradient(90deg, hsl(142 76% 50%), hsl(142 76% 60%))'
                                : 'linear-gradient(90deg, hsl(220 9% 50%), hsl(220 9% 60%))'
                            }}
                          />
                        </div>
                        {/* Progress bar glow effect */}
                        {(isWinner || isDrawCandidate) && (
                          <div 
                            className="absolute inset-0 h-3 rounded-full opacity-30"
                            style={{
                              background: isDrawCandidate 
                                ? `linear-gradient(90deg, transparent ${candidate.percentage}%, hsl(45 93% 47% / 0.2) ${candidate.percentage + 2}%)`
                                : `linear-gradient(90deg, transparent ${candidate.percentage}%, hsl(142 76% 50% / 0.2) ${candidate.percentage + 2}%)`
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}