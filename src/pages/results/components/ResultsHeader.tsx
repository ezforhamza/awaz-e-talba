import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import type { ElectionResults } from '../types';
import { exportToCSV } from '../utils';

interface ResultsHeaderProps {
  results: ElectionResults | null;
}

export function ResultsHeader({ results }: ResultsHeaderProps) {
  const handleExport = () => {
    if (results) {
      exportToCSV(results);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          Election Results
        </h1>
        <p className="mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          View comprehensive voting results and analytics
        </p>
      </div>
      
      {results && (
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Icon icon="solar:download-outline" className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Badge className="bg-green-100 text-green-800" style={{ 
            backgroundColor: 'hsl(142 76% 36%)', 
            color: 'hsl(138 76% 97%)' 
          }}>
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live Results
          </Badge>
        </div>
      )}
    </div>
  );
}