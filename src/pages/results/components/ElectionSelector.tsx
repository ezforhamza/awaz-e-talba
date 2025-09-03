import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Alert, AlertDescription } from "@/ui/alert";
import type { Election } from '../types';
import { getStatusColor } from '../utils';

interface ElectionSelectorProps {
  elections: Election[];
  selectedElectionId: string;
  onSelectionChange: (electionId: string) => void;
}

export function ElectionSelector({ elections, selectedElectionId, onSelectionChange }: ElectionSelectorProps) {
  if (elections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
            <Icon icon="solar:ballot-outline" className="w-5 h-5 text-blue-600" />
            Select Election
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Icon icon="solar:inbox-outline" className="w-16 h-16 mx-auto mb-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
              No Elections Available
            </h3>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>
              No active or completed elections found. Start an election to view results here.
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
          <Icon icon="solar:ballot-outline" className="w-5 h-5 text-blue-600" />
          Select Election
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedElectionId} onValueChange={onSelectionChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose an election to view results" />
            </SelectTrigger>
            <SelectContent>
              {elections.map((election) => (
                <SelectItem 
                  key={election.id} 
                  value={election.id}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{election.title}</span>
                    <Badge className="ml-3" style={getStatusColor(election.status)}>
                      {election.status.toUpperCase()}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
        </div>
      </CardContent>
    </Card>
  );
}