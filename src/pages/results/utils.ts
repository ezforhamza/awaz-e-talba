import type { ElectionResults, ElectionStatus } from './types';

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "draft": 
      return { backgroundColor: 'hsl(220 9% 91%)', color: 'hsl(220 9% 25%)' };
    case "active": 
      return { backgroundColor: 'hsl(142 76% 91%)', color: 'hsl(142 76% 25%)' };
    case "completed": 
      return { backgroundColor: 'hsl(214 100% 91%)', color: 'hsl(214 100% 25%)' };
    case "cancelled": 
      return { backgroundColor: 'hsl(0 84% 91%)', color: 'hsl(0 84% 25%)' };
    default: 
      return { backgroundColor: 'hsl(220 9% 91%)', color: 'hsl(220 9% 25%)' };
  }
};

export const isDrawCondition = (results: ElectionResults) => {
  if (results.vote_counts.length < 2) return false;
  const topVotes = results.vote_counts[0].vote_count;
  return results.vote_counts.filter(vc => vc.vote_count === topVotes).length > 1;
};

export const exportToCSV = (results: ElectionResults) => {
  const csvData = results.vote_counts.map(candidate => ({
    'Candidate Name': candidate.candidate_name,
    'Vote Count': candidate.vote_count,
    'Percentage': `${candidate.percentage}%`
  }));
  
  const csvContent = [
    Object.keys(csvData[0]).join(','),
    ...csvData.map(row => Object.values(row).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${results.election.title}_results.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const calculatePercentages = (voteCounts: Array<{candidate_id: string, candidate_name: string, candidate_image_url?: string, vote_count: number}>, totalVotes: number) => {
  return voteCounts
    .map(vc => ({
      ...vc,
      percentage: totalVotes > 0 ? Math.round((vc.vote_count / totalVotes) * 100) : 0
    }))
    .sort((a, b) => b.vote_count - a.vote_count);
};