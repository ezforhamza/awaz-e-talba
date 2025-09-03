import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { ElectionResults, VoteCount } from '../types';
import { calculatePercentages } from '../utils';

export const useElectionResults = (selectedElectionId: string) => {
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(false);

  const loadResults = async () => {
    if (!selectedElectionId) return;

    setLoading(true);
    try {
      const { data: election, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', selectedElectionId)
        .single();

      if (electionError) throw electionError;

      const { data: candidatesData, error: candidatesError } = await supabase
        .from('election_candidates')
        .select(`
          candidates!inner (
            id,
            name,
            image_url
          )
        `)
        .eq('election_id', selectedElectionId);

      if (candidatesError) throw candidatesError;

      const voteCounts: VoteCount[] = [];
      let totalVotes = 0;

      for (const item of candidatesData || []) {
        const candidate = (item.candidates as any);
        
        const { count, error: countError } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('election_id', selectedElectionId)
          .eq('candidate_id', candidate.id);

        if (countError) {
          console.error('Error counting votes:', countError);
        }

        const voteCount = count || 0;
        totalVotes += voteCount;

        voteCounts.push({
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          candidate_image_url: candidate.image_url,
          vote_count: voteCount,
          percentage: 0
        });
      }

      const sortedVoteCounts = calculatePercentages(voteCounts, totalVotes);

      setResults({
        election,
        vote_counts: sortedVoteCounts,
        total_votes: totalVotes
      });

    } catch (error: any) {
      console.error('Failed to load results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedElectionId) {
      loadResults();
      
      const votesChannel = supabase
        .channel(`results-${selectedElectionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'votes',
            filter: `election_id=eq.${selectedElectionId}`
          },
          () => {
            loadResults();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(votesChannel);
      };
    }
  }, [selectedElectionId]);

  return { results, loading, loadResults };
};