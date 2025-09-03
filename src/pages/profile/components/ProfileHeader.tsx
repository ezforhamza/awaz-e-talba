import { useState, useRef } from 'react';
import { Icon } from "@/components/icon";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import type { AdminProfile } from '../types';

interface ProfileHeaderProps {
  profile: AdminProfile;
  loading: boolean;
  onProfilePictureUpload: (file: File) => Promise<void>;
}

export function ProfileHeader({ profile, loading, onProfilePictureUpload }: ProfileHeaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setUploading(true);
      try {
        await onProfilePictureUpload(file);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  };


  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 -mt-20 relative z-10">
              <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-0">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        {/* Profile Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 -mt-20 relative z-10">
            {/* Profile Picture */}
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile.profilePicture || ''} />
                <AvatarFallback 
                  className="text-2xl font-bold"
                  style={{ 
                    backgroundColor: 'hsl(214 100% 50%)', 
                    color: 'white' 
                  }}
                >
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {/* Upload Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon 
                  icon={uploading ? "solar:refresh-outline" : "solar:camera-bold"} 
                  className={`w-6 h-6 text-white ${uploading ? 'animate-spin' : ''}`} 
                />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                {profile.name}
              </h1>
            </div>
            
          </div>
        </div>
      </CardContent>
    </Card>
  );
}