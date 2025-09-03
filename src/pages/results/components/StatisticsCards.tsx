import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Card, CardContent } from "@/ui/card";
import type { ElectionResults } from '../types';
import { getStatusColor } from '../utils';

interface StatisticsCardsProps {
  results: ElectionResults;
}

export function StatisticsCards({ results }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'hsl(214 100% 91%)' }}>
              <Icon icon="solar:chart-2-outline" className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Total Votes
              </p>
              <p className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                {results.total_votes}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'hsl(276 100% 91%)' }}>
              <Icon icon="solar:users-group-rounded-outline" className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Candidates
              </p>
              <p className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                {results.vote_counts.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'hsl(142 76% 91%)' }}>
              <Icon icon="solar:check-circle-outline" className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Status
              </p>
              <Badge style={getStatusColor(results.election.status)}>
                {results.election.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}