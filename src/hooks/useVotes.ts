import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

interface Vote {
  id: string
  election_id: string
  candidate_id: string
  student_voting_id: string
  voted_at: string
  ip_address: string | null
  user_agent: string | null
}

interface VoteWithDetails extends Vote {
  candidate: {
    id: string
    name: string
    description: string | null
    image_url: string | null
  }
  election: {
    id: string
    title: string
    status: string
  }
}

interface VoteCount {
  candidate_id: string
  candidate_name: string
  candidate_image_url: string | null
  vote_count: number
  percentage: number
}

interface ElectionResults {
  election: {
    id: string
    title: string
    description: string | null
    status: string
    start_date: string
    end_date: string
    total_votes: number
  }
  vote_counts: VoteCount[]
  total_votes: number
}

export const useVotes = () => {
  const { data: votes, isLoading, error, refetch } = useQuery({
    queryKey: ['votes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          candidates (
            id,
            name,
            description,
            image_url
          ),
          elections (
            id,
            title,
            status
          )
        `)
        .order('voted_at', { ascending: false })
      
      if (error) throw new Error(error.message)
      return data as VoteWithDetails[]
    },
  })

  // Set up realtime subscription for votes
  useEffect(() => {
    const channel = supabase
      .channel('votes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        (payload) => {
          console.log('Votes change received!', payload)
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  return {
    votes: votes || [],
    isLoading,
    error: error?.message,
    refetch
  }
}

export const useElectionResults = (electionId: string) => {
  const { data: results, isLoading, error, refetch } = useQuery({
    queryKey: ['election-results', electionId],
    queryFn: async () => {
      // Get election details
      const { data: election, error: electionError } = await supabase
        .from('elections')
        .select(`
          id,
          title,
          description,
          status,
          start_date,
          end_date
        `)
        .eq('id', electionId)
        .single()
      
      if (electionError) throw new Error(electionError.message)

      // Get vote counts with candidate details
      const { data: voteCounts, error: voteError } = await supabase
        .from('votes')
        .select(`
          candidate_id,
          candidates (
            id,
            name,
            image_url
          )
        `)
        .eq('election_id', electionId)
      
      if (voteError) throw new Error(voteError.message)

      // Calculate vote counts
      const candidateVotes = voteCounts.reduce((acc, vote) => {
        const candidateId = vote.candidate_id
        if (!acc[candidateId]) {
          acc[candidateId] = {
            candidate_id: candidateId,
            candidate_name: (vote.candidates as any)?.name || 'Unknown',
            candidate_image_url: (vote.candidates as any)?.image_url || null,
            vote_count: 0
          }
        }
        acc[candidateId].vote_count++
        return acc
      }, {} as Record<string, Omit<VoteCount, 'percentage'>>)

      const totalVotes = voteCounts.length
      const vote_counts: VoteCount[] = Object.values(candidateVotes).map(candidate => ({
        ...candidate,
        percentage: totalVotes > 0 ? Math.round((candidate.vote_count / totalVotes) * 100) : 0
      })).sort((a, b) => b.vote_count - a.vote_count)

      return {
        election: {
          ...election,
          total_votes: totalVotes
        },
        vote_counts,
        total_votes: totalVotes
      } as ElectionResults
    },
    enabled: !!electionId
  })

  // Set up realtime subscription for election results
  useEffect(() => {
    if (!electionId) return

    const channel = supabase
      .channel(`election-${electionId}-votes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `election_id=eq.${electionId}`
        },
        (payload) => {
          console.log('Election votes change received!', payload)
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [electionId, refetch])

  return {
    results,
    isLoading,
    error: error?.message,
    refetch
  }
}

export const useVotingAnalytics = () => {
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['voting-analytics'],
    queryFn: async () => {
      // Get total votes count
      const { count: totalVotes, error: votesError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
      
      if (votesError) throw new Error(votesError.message)

      // Get active elections count
      const { count: activeElections, error: activeError } = await supabase
        .from('elections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      
      if (activeError) throw new Error(activeError.message)

      // Get total students count
      const { count: totalStudents, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      
      if (studentsError) throw new Error(studentsError.message)

      // Get voting participation over time (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: dailyVotes, error: dailyError } = await supabase
        .from('votes')
        .select('voted_at')
        .gte('voted_at', sevenDaysAgo.toISOString())
        .order('voted_at', { ascending: true })
      
      if (dailyError) throw new Error(dailyError.message)

      // Group votes by date
      const votingTrend = dailyVotes.reduce((acc, vote) => {
        const date = new Date(vote.voted_at).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Convert to array format for charts
      const trendData = Object.entries(votingTrend).map(([date, count]) => ({
        date,
        votes: count
      }))

      const participationRate = totalStudents && totalStudents > 0 
        ? Math.round(((totalVotes || 0) / totalStudents) * 100) 
        : 0

      return {
        totalVotes: totalVotes || 0,
        activeElections: activeElections || 0,
        totalStudents: totalStudents || 0,
        participationRate,
        votingTrend: trendData
      }
    },
  })

  // Set up realtime subscription for analytics
  useEffect(() => {
    const votesChannel = supabase
      .channel('analytics-votes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        () => refetch()
      )
      .subscribe()

    const electionsChannel = supabase
      .channel('analytics-elections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'elections'
        },
        () => refetch()
      )
      .subscribe()

    const studentsChannel = supabase
      .channel('analytics-students')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'students'
        },
        () => refetch()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(votesChannel)
      supabase.removeChannel(electionsChannel)
      supabase.removeChannel(studentsChannel)
    }
  }, [refetch])

  return {
    analytics,
    isLoading,
    error: error?.message,
    refetch
  }
}