import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth as useAuthContext } from '@/contexts/AuthContext'

interface SignInData {
  email: string
  password: string
}

interface SignUpData {
  email: string
  password: string
  name: string
}

export const useAuth = () => {
  const queryClient = useQueryClient()
  const { setUser } = useAuthContext()

  // Get current user
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  })

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: SignInData) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      // Store user data in context for profile management
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email || 'User',
          profilePicture: data.user.user_metadata?.profile_picture || undefined,
        })
      }
    },
  })

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async ({ email, password, name }: SignUpData) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) {
        throw new Error(error.message)
      }
    },
  })

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.clear()
      // Clear user data from context
      setUser(null)
    },
  })

  return {
    user,
    isUserLoading,
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    signInError: signInMutation.error?.message,
    signUpError: signUpMutation.error?.message,
    resetPasswordError: resetPasswordMutation.error?.message,
    signOutError: signOutMutation.error?.message,
  }
}