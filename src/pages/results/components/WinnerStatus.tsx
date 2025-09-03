import { Icon } from "@/components/icon";
import { Alert, AlertDescription } from "@/ui/alert";
import type { ElectionResults } from '../types';
import { isDrawCondition } from '../utils';

interface WinnerStatusProps {
  results: ElectionResults;
}

export function WinnerStatus({ results }: WinnerStatusProps) {
  if (results.total_votes === 0) return null;
  
  const isDraw = isDrawCondition(results);

  if (isDraw) {
    return (
      <div className="relative overflow-hidden rounded-lg border shadow-sm" style={{ 
        borderColor: 'hsl(var(--border))', 
        backgroundColor: 'hsl(var(--card))',
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10"></div>
        <div className="relative p-4 flex items-center gap-3">
          <div className="p-2 rounded-full" style={{ backgroundColor: 'hsl(45 93% 47%)' }}>
            <Icon icon="solar:medal-star-bold" className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              It's a Draw!
            </p>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {results.vote_counts.filter(vc => vc.vote_count === results.vote_counts[0]?.vote_count).length} candidates tied with {results.vote_counts[0]?.vote_count} votes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border shadow-sm" style={{ 
      borderColor: 'hsl(var(--border))', 
      backgroundColor: 'hsl(var(--card))',
    }}>
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10"></div>
      <div className="relative p-4 flex items-center gap-3">
        <div className="p-2 rounded-full" style={{ backgroundColor: 'hsl(142 76% 50%)' }}>
          <Icon icon="solar:crown-bold" className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            Leading: {results.vote_counts[0]?.candidate_name}
          </p>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {results.vote_counts[0]?.vote_count} votes ({results.vote_counts[0]?.percentage}%)
          </p>
        </div>
      </div>
    </div>
  );
}