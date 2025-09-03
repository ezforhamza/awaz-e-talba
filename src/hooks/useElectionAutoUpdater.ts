import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useElectionAutoUpdater = () => {
  const queryClient = useQueryClient()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    // Set up realtime subscription for election changes
    channelRef.current = supabase
      .channel('election-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'elections'
        },
        (payload) => {
          // Invalidate relevant queries to refresh the UI immediately
          queryClient.invalidateQueries({ queryKey: ['elections'] })
          queryClient.invalidateQueries({ queryKey: ['active-elections'] })
          
          // Show toast notification for status changes
          const { new: newElection, old: oldElection } = payload
          if (newElection.status !== oldElection.status) {
            const statusMessages = {
              active: `🟢 "${newElection.title}" election is now active!`,
              completed: `✅ "${newElection.title}" election has ended.`,
              cancelled: `❌ "${newElection.title}" election was cancelled.`
            }
            
            const message = statusMessages[newElection.status as keyof typeof statusMessages]
            if (message) {
              toast.success(message)
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'elections'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['elections'] })
          
          const election = payload.new as any
          toast.success(`🗳️ New election created: "${election.title}"`)
        }
      )
      .subscribe()

    // Set up periodic auto-update check (every 15 seconds for more responsiveness)
    const runAutoUpdate = async () => {
      try {
        const { error } = await supabase.rpc('auto_update_election_status')
        if (error) {
          console.error('Auto-update error:', error)
        }
      } catch (error) {
        console.error('Failed to run auto-update:', error)
      }
    }

    // Run immediately
    runAutoUpdate()

    // Then run every 15 seconds
    intervalRef.current = setInterval(runAutoUpdate, 15000)

    return () => {
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [queryClient])

  // Manual trigger function
  const triggerUpdate = async () => {
    try {
      const { data, error } = await supabase.rpc('auto_update_election_status')
      if (error) throw error
      
      if (data && data > 0) {
        queryClient.invalidateQueries({ queryKey: ['elections'] })
        queryClient.invalidateQueries({ queryKey: ['active-elections'] })
        return { success: true, updated: data }
      }
      
      return { success: true, updated: 0 }
    } catch (error) {
      console.error('Manual trigger failed:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    triggerUpdate
  }
}