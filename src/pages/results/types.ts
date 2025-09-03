export interface VoteCount {
  candidate_id: string;
  candidate_name: string;
  candidate_image_url?: string;
  vote_count: number;
  percentage: number;
}

export interface Election {
  id: string;
  title: string;
  description?: string;
  status: string;
  end_date: string;
  allow_multiple_votes: boolean;
}

export interface ElectionResults {
  election: Election;
  vote_counts: VoteCount[];
  total_votes: number;
}

export type ElectionStatus = 'draft' | 'active' | 'completed' | 'cancelled';