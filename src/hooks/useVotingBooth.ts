import { supabase } from '@/lib/supabase'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

interface BoothElection {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  allow_multiple_votes: boolean
  status: string
}

interface BoothCandidate {
  id: string
  name: string
  description: string | null
  image_url: string | null
  candidate_position: number
}

interface BoothStudent {
  id: string
  name: string
  roll_number: string
  class: string | null
  section: string | null
  voting_id: string
  has_voted: boolean
}

interface VotingSession {
  student: BoothStudent | null
  election: BoothElection | null
  candidates: BoothCandidate[]
}

export const useVotingBooth = (boothId: string | null) => {
  const [votingSession, setVotingSession] = useState<VotingSession>({
    student: null,
    election: null,
    candidates: []
  })
  const [isElectionExpired, setIsElectionExpired] = useState(false)

  // Get election by booth ID
  const { data: election, isLoading: electionLoading, error: electionError } = useQuery({
    queryKey: ['booth-election', boothId],
    queryFn: async () => {
      if (!boothId) return null

      const { data, error } = await supabase
        .rpc('get_election_by_booth_id', { booth_id: boothId })
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No active election found
        }
        throw new Error(error.message)
      }

      return data as BoothElection
    },
    enabled: !!boothId,
  })

  // Get candidates by booth ID
  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['booth-candidates', boothId],
    queryFn: async () => {
      if (!boothId) return []

      const { data, error } = await supabase
        .rpc('get_candidates_by_booth_id', { booth_id: boothId })

      if (error) {
        throw new Error(error.message)
      }

      return data as BoothCandidate[]
    },
    enabled: !!boothId && !!election,
  })

  // Verify student voting ID
  const verifyStudentMutation = useMutation({
    mutationFn: async (votingId: string) => {
      // Always reset session first to clear any cached state
      setVotingSession({
        student: null,
        election: null,
        candidates: []
      })

      if (!boothId) {
        throw new Error('Invalid voting booth')
      }

      const normalizedVotingId = votingId.toUpperCase().trim()

      const { data, error } = await supabase
        .rpc('verify_student_for_booth', { 
          booth_id: boothId, 
          student_voting_id: normalizedVotingId
        })
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Invalid voting ID. Please check your voting ID and try again.')
        }
        throw new Error('Failed to verify voting ID. Please try again.')
      }

      const student = data as BoothStudent

      if (student.has_voted && !election?.allow_multiple_votes) {
        throw new Error('You have already voted in this election.')
      }

      setVotingSession({
        student,
        election: election!,
        candidates: candidates || []
      })

      return student
    },
  })

  // Submit vote
  const submitVoteMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      if (!votingSession.student || !votingSession.election) {
        throw new Error('Invalid voting session. Please start over.')
      }

      const { data, error } = await supabase
        .from('votes')
        .insert({
          election_id: votingSession.election.id,
          candidate_id: candidateId,
          student_voting_id: votingSession.student.voting_id,
          user_agent: navigator.userAgent,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already voted in this election.')
        }
        throw new Error('Failed to submit vote. Please try again.')
      }

      // Mark student as voted in current session
      setVotingSession(prev => ({
        ...prev,
        student: prev.student ? { ...prev.student, has_voted: true } : null
      }))

      return data
    },
    onSuccess: () => {
      // Reset session after successful vote to prevent caching issues
      setTimeout(() => {
        resetSession()
      }, 2000) // Give time for success message to show
    }
  })

  const resetSession = () => {
    setVotingSession({
      student: null,
      election: null,
      candidates: []
    })
    
    // Clear any mutation states
    verifyStudentMutation.reset()
    submitVoteMutation.reset()
  }

  // Check election expiry
  useEffect(() => {
    if (!election) return

    const checkElectionStatus = () => {
      const now = new Date()
      const endDate = new Date(election.end_date)
      
      if (endDate < now) {
        setIsElectionExpired(true)
        // If there's an active voting session, clear it
        if (votingSession.student) {
          resetSession()
        }
      } else {
        setIsElectionExpired(false)
      }
    }

    // Check immediately
    checkElectionStatus()

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkElectionStatus, 30000)

    return () => clearInterval(interval)
  }, [election, votingSession.student])

  return {
    // Data
    election,
    candidates,
    votingSession,
    isElectionExpired,
    
    // Loading states
    isElectionLoading: electionLoading,
    isCandidatesLoading: candidatesLoading,
    isVerifyingStudent: verifyStudentMutation.isPending,
    isSubmittingVote: submitVoteMutation.isPending,
    
    // Actions
    verifyStudent: verifyStudentMutation.mutateAsync,
    submitVote: submitVoteMutation.mutateAsync,
    resetSession,
    
    // Errors
    electionError: electionError?.message,
    verificationError: verifyStudentMutation.error?.message,
    submissionError: submitVoteMutation.error?.message,
  }
}