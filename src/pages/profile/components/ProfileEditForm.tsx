import { useState } from 'react';
import { Icon } from "@/components/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import type { AdminProfile, ProfileUpdateData } from '../types';

interface ProfileEditFormProps {
  profile: AdminProfile;
  loading: boolean;
  onUpdateProfile: (data: ProfileUpdateData) => Promise<boolean>;
}

export function ProfileEditForm({ profile, loading, onUpdateProfile }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: profile.name,
    profilePicture: profile.profilePicture,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const success = await onUpdateProfile(formData);
      if (success) {
        // Form will show success message via toast
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = () => {
    return formData.name !== profile.name;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
          <Icon icon="solar:user-bold" className="w-5 h-5" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" style={{ color: 'hsl(var(--foreground))' }}>
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              disabled={loading || submitting}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!hasChanges() || loading || submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <Icon icon="solar:refresh-outline" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon icon="solar:check-bold" className="w-4 h-4" />
              )}
              {submitting ? 'Updating...' : 'Update Profile'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                name: profile.name,
                profilePicture: profile.profilePicture,
              })}
              disabled={!hasChanges() || loading || submitting}
            >
              <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
              Reset Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}