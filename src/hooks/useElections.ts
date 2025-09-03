import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentAdmin } from './useCurrentAdmin'
import { useElectionAutoUpdater } from './useElectionAutoUpdater'

interface Election {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  allow_multiple_votes: boolean
  auto_start: boolean
  admin_id: string | null
  created_at: string
  updated_at: string
}

interface CreateElectionData {
  title: string
  description?: string
  start_date: string
  end_date: string
  allow_multiple_votes?: boolean
  auto_start?: boolean
  candidate_ids?: string[]
}

export const useElections = () => {
  const queryClient = useQueryClient()
  const { adminId, isLoading: isAdminLoading } = useCurrentAdmin()
  
  // Set up automatic election status updates
  const { triggerUpdate } = useElectionAutoUpdater()

  // Fetch all elections
  const { data: elections, isLoading, error } = useQuery({
    queryKey: ['elections', adminId],
    enabled: !!adminId && !isAdminLoading,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elections')
        .select(`
          *,
          election_candidates (
            candidate_id,
            candidates (
              id,
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(error.message)
      
      // Transform the data to include candidate_ids
      const electionsWithCandidates = data?.map(election => ({
        ...election,
        candidate_ids: election.election_candidates?.map((ec: any) => ec.candidate_id) || [],
        candidates: election.election_candidates?.map((ec: any) => ec.candidates) || []
      })) || []
      
      return electionsWithCandidates as (Election & { candidate_ids: string[], candidates: any[] })[]
    },
  })

  // Note: Realtime subscriptions are now handled by useElectionAutoUpdater hook

  // Create election mutation
  const createElectionMutation = useMutation({
    mutationFn: async (electionData: CreateElectionData) => {
      if (!adminId) {
        throw new Error('Please wait for authentication to complete')
      }
      
      const { candidate_ids, ...electionPayload } = electionData
      
      // Create election first
      const { data: election, error: electionError } = await supabase
        .from('elections')
        .insert([{
          ...electionPayload,
          status: 'draft',
          admin_id: adminId
        }])
        .select()
        .single()
      
      if (electionError) throw new Error(electionError.message)
      
      // Link candidates to election if provided
      if (candidate_ids && candidate_ids.length > 0) {
        const electionCandidates = candidate_ids.map(candidateId => ({
          election_id: election.id,
          candidate_id: candidateId
        }))
        
        const { error: linkError } = await supabase
          .from('election_candidates')
          .insert(electionCandidates)
        
        if (linkError) throw new Error(linkError.message)
      }
      
      return election
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
    },
  })

  // Update election mutation
  const updateElectionMutation = useMutation({
    mutationFn: async ({ id, candidate_ids, ...updateData }: Partial<Election & { candidate_ids: string[] }> & { id: string }) => {
      // Update election data
      const { data: election, error: electionError } = await supabase
        .from('elections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (electionError) throw new Error(electionError.message)
      
      // Update candidate links if provided
      if (candidate_ids !== undefined) {
        // Remove existing candidate links
        const { error: deleteError } = await supabase
          .from('election_candidates')
          .delete()
          .eq('election_id', id)
        
        if (deleteError) throw new Error(deleteError.message)
        
        // Add new candidate links
        if (candidate_ids.length > 0) {
          const electionCandidates = candidate_ids.map(candidateId => ({
            election_id: id,
            candidate_id: candidateId
          }))
          
          const { error: linkError } = await supabase
            .from('election_candidates')
            .insert(electionCandidates)
          
          if (linkError) throw new Error(linkError.message)
        }
      }
      
      return election
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
    },
  })

  // Delete election mutation
  const deleteElectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('elections')
        .delete()
        .eq('id', id)
      
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
    },
  })

  // Force start election (admin can start before scheduled time)
  const forceStartElectionMutation = useMutation({
    mutationFn: async (id: string) => {
      // First check if election is in the past
      const election = elections?.find(e => e.id === id)
      if (election && new Date(election.end_date) < new Date()) {
        throw new Error('Cannot start an election that has already ended. This election took place in the past.')
      }
      
      const { data, error } = await supabase
        .rpc('force_start_election', { election_id: id })
      
      if (error) throw new Error(error.message)
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start election')
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
    },
  })

  // Stop election (manually complete)
  const stopElectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .rpc('stop_election', { election_id: id })
      
      if (error) throw new Error(error.message)
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to stop election')
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
    },
  })

  // Helper functions for election status
  const isElectionInPast = (election: Election) => {
    return new Date(election.end_date) < new Date()
  }
  
  const isElectionActive = (election: Election) => {
    const now = new Date()
    const startDate = new Date(election.start_date)
    const endDate = new Date(election.end_date)
    return startDate <= now && now <= endDate
  }
  
  const canStartElection = (election: Election) => {
    return election.status === 'draft' && !isElectionInPast(election)
  }
  
  const getElectionTimeStatus = (election: Election) => {
    const now = new Date()
    const startDate = new Date(election.start_date)
    const endDate = new Date(election.end_date)
    
    if (endDate < now) return 'past'
    if (startDate <= now && now <= endDate) return 'current'
    return 'future'
  }

  // Calculate stats
  const stats = elections ? {
    total: elections.length,
    active: elections.filter(e => e.status === 'active').length,
    draft: elections.filter(e => e.status === 'draft').length,
    completed: elections.filter(e => e.status === 'completed').length,
    cancelled: elections.filter(e => e.status === 'cancelled').length,
    past: elections.filter(e => isElectionInPast(e)).length,
  } : null

  return {
    elections: elections || [],
    stats,
    isLoading,
    error: error?.message,
    createElection: createElectionMutation.mutateAsync,
    updateElection: updateElectionMutation.mutateAsync,
    deleteElection: deleteElectionMutation.mutateAsync,
    forceStartElection: forceStartElectionMutation.mutateAsync,
    stopElection: stopElectionMutation.mutateAsync,
    isCreating: createElectionMutation.isPending,
    isUpdating: updateElectionMutation.isPending,
    isDeleting: deleteElectionMutation.isPending,
    isStarting: forceStartElectionMutation.isPending,
    isStopping: stopElectionMutation.isPending,
    createError: createElectionMutation.error?.message,
    updateError: updateElectionMutation.error?.message,
    deleteError: deleteElectionMutation.error?.message,
    startError: forceStartElectionMutation.error?.message,
    stopError: stopElectionMutation.error?.message,
    
    // Helper functions
    isElectionInPast,
    isElectionActive,
    canStartElection,
    getElectionTimeStatus,
    triggerAutoUpdate: triggerUpdate,
  }
}