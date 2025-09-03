import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { DashboardStats, LiveElectionData, ActivityItem, VoteData } from '../types';

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalElections: 0,
    activeElections: 0,
    totalVotes: 0,
    totalCandidates: 0,
    totalStudents: 0,
    participationRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardStats = async () => {
    try {
      // Get elections count and active elections
      const { data: elections, error: electionsError } = await supabase
        .from('elections')
        .select('id, status');

      if (electionsError) throw electionsError;

      const totalElections = elections?.length || 0;
      const activeElections = elections?.filter(e => e.status === 'active')?.length || 0;

      // Get total votes
      const { count: totalVotes, error: votesError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true });

      if (votesError) throw votesError;

      // Get total candidates
      const { count: totalCandidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });

      if (candidatesError) throw candidatesError;

      // Get total students
      const { count: totalStudents, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      if (studentsError) throw studentsError;

      // Calculate participation rate
      const participationRate = (totalStudents || 0) > 0 
        ? Math.round(((totalVotes || 0) / (totalStudents || 0)) * 100) 
        : 0;

      setStats({
        totalElections,
        activeElections,
        totalVotes: totalVotes || 0,
        totalCandidates: totalCandidates || 0,
        totalStudents: totalStudents || 0,
        participationRate,
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();

    // Set up real-time subscription for live updates
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        () => {
          loadDashboardStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'elections'
        },
        () => {
          loadDashboardStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading, refetch: loadDashboardStats };
};

export const useLiveElections = () => {
  const [elections, setElections] = useState<LiveElectionData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLiveElections = async () => {
    try {
      // Get active elections
      const { data: activeElections, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .eq('status', 'active');

      if (electionsError) throw electionsError;

      const liveElections: LiveElectionData[] = [];

      for (const election of activeElections || []) {
        // Get candidates for this election
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('election_candidates')
          .select(`
            candidates!inner (
              id,
              name,
              image_url
            )
          `)
          .eq('election_id', election.id);

        if (candidatesError) {
          console.error('Error fetching candidates:', candidatesError);
          continue;
        }

        // Get vote counts for each candidate
        const voteCounts: VoteData[] = [];
        let totalVotes = 0;

        for (const item of candidatesData || []) {
          const candidate = (item.candidates as any);
          
          const { count, error: countError } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('election_id', election.id)
            .eq('candidate_id', candidate.id);

          if (countError) {
            console.error('Error counting votes:', countError);
            continue;
          }

          const voteCount = count || 0;
          totalVotes += voteCount;

          voteCounts.push({
            candidate_id: candidate.id,
            candidate_name: candidate.name,
            candidate_image_url: candidate.image_url,
            vote_count: voteCount,
            percentage: 0, // Will calculate after we have total
          });
        }

        // Calculate percentages and sort by votes
        const sortedVoteCounts = voteCounts
          .map(vc => ({
            ...vc,
            percentage: totalVotes > 0 ? Math.round((vc.vote_count / totalVotes) * 100) : 0
          }))
          .sort((a, b) => b.vote_count - a.vote_count);

        // Calculate participation rate
        const { count: totalStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        const participationRate = (totalStudents || 0) > 0 
          ? Math.round((totalVotes / (totalStudents || 0)) * 100) 
          : 0;

        liveElections.push({
          id: election.id,
          title: election.title,
          status: election.status,
          total_votes: totalVotes,
          vote_counts: sortedVoteCounts,
          start_date: election.start_date,
          end_date: election.end_date,
          participation_rate: participationRate,
        });
      }

      setElections(liveElections);
    } catch (error) {
      console.error('Error loading live elections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveElections();

    // Set up real-time subscription
    const channel = supabase
      .channel('live-elections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        () => {
          loadLiveElections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { elections, loading, refetch: loadLiveElections };
};

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentActivity = async () => {
    try {
      // Get recent votes with election and candidate info
      const { data: recentVotes, error: votesError } = await supabase
        .from('votes')
        .select(`
          id,
          created_at,
          elections!inner(title),
          candidates!inner(name),
          students!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (votesError) throw votesError;

      const activities: ActivityItem[] = [];

      // Add vote activities
      for (const vote of recentVotes || []) {
        activities.push({
          id: `vote-${vote.id}`,
          type: 'vote_cast',
          election_title: (vote.elections as any).title,
          candidate_name: (vote.candidates as any).name,
          student_name: (vote.students as any).name,
          timestamp: vote.created_at,
          details: `${(vote.students as any).name} voted for ${(vote.candidates as any).name} in ${(vote.elections as any).title}`,
        });
      }

      // Get recent election activities
      const { data: recentElections, error: electionsError } = await supabase
        .from('elections')
        .select('id, title, status, created_at, start_date')
        .order('created_at', { ascending: false })
        .limit(5);

      if (electionsError) throw electionsError;

      // Add election activities
      for (const election of recentElections || []) {
        if (election.status === 'active') {
          activities.push({
            id: `election-started-${election.id}`,
            type: 'election_started',
            election_title: election.title,
            timestamp: election.start_date || election.created_at,
            details: `Election "${election.title}" has started`,
          });
        } else if (election.status === 'draft') {
          activities.push({
            id: `election-created-${election.id}`,
            type: 'election_created',
            election_title: election.title,
            timestamp: election.created_at,
            details: `New election "${election.title}" was created`,
          });
        }
      }

      // Sort all activities by timestamp and take the most recent
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentActivity();

    // Set up real-time subscription
    const channel = supabase
      .channel('recent-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes'
        },
        () => {
          loadRecentActivity();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'elections'
        },
        () => {
          loadRecentActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { activities, loading, refetch: loadRecentActivity };
};