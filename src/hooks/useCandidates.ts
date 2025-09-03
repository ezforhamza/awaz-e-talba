import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentAdmin } from './useCurrentAdmin'

interface Candidate {
  id: string
  election_id: string | null
  name: string
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

interface CreateCandidateData {
  name: string
  description?: string
  image?: File
}

export const useCandidates = (electionId?: string) => {
  const queryClient = useQueryClient()
  const { adminId, isLoading: isAdminLoading } = useCurrentAdmin()

  // Fetch candidates (optionally filtered by election)
  const { data: candidates, isLoading, error } = useQuery({
    queryKey: electionId ? ['candidates', electionId, adminId] : ['candidates', adminId],
    enabled: !!adminId && !isAdminLoading,
    queryFn: async () => {
      let query = supabase
        .from('candidates')
        .select(`
          *,
          elections (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false })
      
      if (electionId) {
        query = query.eq('election_id', electionId)
      }
      
      const { data, error } = await query
      
      if (error) throw new Error(error.message)
      return data as (Candidate & { elections?: { id: string; title: string } })[]
    },
  })

  // Upload image to Supabase storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `candidate-${Date.now()}.${fileExt}`
    const filePath = `candidates/${fileName}`

    const { error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file)

    if (error) throw new Error(error.message)

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath)

    return publicUrl
  }

  // Create candidate mutation
  const createCandidateMutation = useMutation({
    mutationFn: async (candidateData: CreateCandidateData) => {
      if (!adminId) {
        throw new Error('Please wait for authentication to complete')
      }
      
      let image_url = null

      // Upload image if provided
      if (candidateData.image) {
        image_url = await uploadImage(candidateData.image)
      }

      const { data, error } = await supabase
        .from('candidates')
        .insert([{
          name: candidateData.name,
          description: candidateData.description,
          image_url,
          admin_id: adminId
        }])
        .select()
        .single()
      
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })

  // Update candidate mutation
  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, image, ...updateData }: Partial<CreateCandidateData> & { id: string; image_url?: string }) => {
      let image_url = updateData.image_url

      // Upload new image if provided
      if (image) {
        image_url = await uploadImage(image)
      }

      const { data, error } = await supabase
        .from('candidates')
        .update({
          ...updateData,
          image_url,
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })

  // Delete candidate mutation
  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check if candidate is part of any election
      const { data: electionCandidates } = await supabase
        .from('election_candidates')
        .select('election_id')
        .eq('candidate_id', id)

      if (electionCandidates && electionCandidates.length > 0) {
        throw new Error('Cannot delete candidate who is part of an election')
      }

      // Get candidate to delete image from storage
      const { data: candidate } = await supabase
        .from('candidates')
        .select('image_url')
        .eq('id', id)
        .single()

      // Delete from database
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id)
      
      if (error) throw new Error(error.message)

      // Delete image from storage if exists
      if (candidate?.image_url) {
        const imagePath = candidate.image_url.split('/').pop()
        if (imagePath) {
          await supabase.storage
            .from('uploads')
            .remove([`candidates/${imagePath}`])
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })

  // Calculate stats
  const stats = candidates ? {
    total: candidates.length,
    withImages: candidates.filter(c => c.image_url).length,
    withDescriptions: candidates.filter(c => c.description).length,
  } : null

  return {
    candidates: candidates || [],
    stats,
    isLoading,
    error: error?.message,
    createCandidate: createCandidateMutation.mutateAsync,
    updateCandidate: updateCandidateMutation.mutateAsync,
    deleteCandidate: deleteCandidateMutation.mutateAsync,
    isCreating: createCandidateMutation.isPending,
    isUpdating: updateCandidateMutation.isPending,
    isDeleting: deleteCandidateMutation.isPending,
    createError: createCandidateMutation.error?.message,
    updateError: updateCandidateMutation.error?.message,
    deleteError: deleteCandidateMutation.error?.message,
  }
}