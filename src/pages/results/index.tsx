import { useElections } from "@/hooks/useElections";
import { useState, useEffect } from "react";
import type { Election } from './types';
import { useElectionResults } from './hooks/useElectionResults';
import {
  ElectionSelector,
  ResultsHeader,
  StatisticsCards,
  WinnerStatus,
  ResultsDisplay,
  LoadingState
} from './components';

export default function Results() {
  const { elections } = useElections();
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  
  const electionsWithResults: Election[] = elections.filter(
    election => election.status === 'active' || election.status === 'completed'
  );
  
  const { results, loading } = useElectionResults(selectedElectionId);

  useEffect(() => {
    if (electionsWithResults.length === 1 && !selectedElectionId) {
      setSelectedElectionId(electionsWithResults[0].id);
    }
  }, [electionsWithResults, selectedElectionId]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ResultsHeader results={results} />
      
      <ElectionSelector 
        elections={electionsWithResults}
        selectedElectionId={selectedElectionId}
        onSelectionChange={setSelectedElectionId}
      />

      {selectedElectionId && results && (
        <>
          <StatisticsCards results={results} />
          <WinnerStatus results={results} />
          <ResultsDisplay results={results} />
        </>
      )}

      {selectedElectionId && loading && <LoadingState />}
    </div>
  );
}