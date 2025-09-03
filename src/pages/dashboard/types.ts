export interface DashboardStats {
  totalElections: number;
  activeElections: number;
  totalVotes: number;
  totalCandidates: number;
  totalStudents: number;
  participationRate: number;
}

export interface LiveElectionData {
  id: string;
  title: string;
  status: string;
  total_votes: number;
  vote_counts: VoteData[];
  start_date: string;
  end_date: string;
  participation_rate: number;
}

export interface VoteData {
  candidate_id: string;
  candidate_name: string;
  candidate_image_url?: string;
  vote_count: number;
  percentage: number;
}

export interface ActivityItem {
  id: string;
  type: 'vote_cast' | 'election_created' | 'election_started' | 'election_ended';
  election_title?: string;
  candidate_name?: string;
  student_name?: string;
  timestamp: string;
  details: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  votes: number;
  election_id: string;
}