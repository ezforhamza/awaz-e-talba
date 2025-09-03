import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminProfile, ProfileUpdateData, PasswordChangeData } from '../types';

export const useProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<AdminProfile>({
    id: user?.id || 'admin-1',
    name: user?.name || 'System Administrator',
    profilePicture: user?.profilePicture || '',
  });
  const [loading, setLoading] = useState(false);

  // Update profile when user context changes
  useEffect(() => {
    if (user) {
      setProfile({
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from a user profile API
      // For demo, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Profile is already set in useState for demo
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    setLoading(true);
    try {
      // In a real app, this would call an API to update the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProfile = {
        ...profile,
        ...data,
      };
      
      setProfile(updatedProfile);
      
      // Update the global auth context so header reflects changes
      updateUser({
        name: updatedProfile.name,
        profilePicture: updatedProfile.profilePicture,
      });
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data: PasswordChangeData) => {
    setLoading(true);
    try {
      // In a real app, this would call an API to change password
      if (data.newPassword !== data.confirmPassword) {
        toast.error('New passwords do not match');
        return false;
      }
      
      if (data.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    setLoading(true);
    try {
      // In a real app, this would upload to storage service
      const reader = new FileReader();
      
      return new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const updatedProfile = {
            ...profile,
            profilePicture: result,
          };
          setProfile(updatedProfile);
          
          // Update the global auth context so header reflects changes
          updateUser({
            profilePicture: result,
          });
          
          setLoading(false);
          toast.success('Profile picture updated successfully');
          resolve(result);
        };
        
        reader.onerror = () => {
          setLoading(false);
          toast.error('Failed to upload profile picture');
          reject(new Error('Upload failed'));
        };
        
        reader.readAsDataURL(file);
      });
    } catch (error) {
      setLoading(false);
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    changePassword,
    uploadProfilePicture,
    refetch: fetchProfile,
  };
};

