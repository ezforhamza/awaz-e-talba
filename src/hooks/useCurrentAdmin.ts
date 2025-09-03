import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'

interface Admin {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export const useCurrentAdmin = () => {
  const { user } = useAuth()

  const { data: admin, isLoading, error, refetch } = useQuery({
    queryKey: ['current-admin', user?.email],
    queryFn: async () => {
      if (!user?.email) {
        return null
      }

      // First try to find existing admin record
      const { data: existingAdmin, error: selectError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        throw new Error(`Error fetching admin: ${selectError.message}`)
      }

      if (existingAdmin) {
        return existingAdmin as Admin
      }

      // If no admin record exists, create one
      console.log('Creating admin record for:', user.email)
      const { data: newAdmin, error: insertError } = await supabase
        .from('admins')
        .insert({
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email.split('@')[0]
        })
        .select()
        .single()

      if (insertError) {
        // If insert failed due to unique constraint, try to fetch again (race condition)
        if (insertError.code === '23505') {
          const { data: raceAdmin, error: raceError } = await supabase
            .from('admins')
            .select('*')
            .eq('email', user.email)
            .single()
          
          if (raceError) {
            throw new Error(`Failed to create or fetch admin record: ${insertError.message}`)
          }
          return raceAdmin as Admin
        }
        throw new Error(`Failed to create admin record: ${insertError.message}`)
      }

      console.log('Admin record created successfully:', newAdmin)
      return newAdmin as Admin
    },
    enabled: !!user?.email,
    retry: (failureCount) => {
      // Retry up to 3 times for any error
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff
  })

  return {
    admin,
    adminId: admin?.id,
    isLoading,
    error: error?.message,
    refetch,
  }
}