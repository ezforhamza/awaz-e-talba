import { useProfile } from './hooks/useProfile';
import {
  ProfileHeader,
  ProfileEditForm,
  PasswordChangeForm
} from './components';

export default function Profile() {
  const {
    profile,
    loading,
    updateProfile,
    changePassword,
    uploadProfilePicture,
  } = useProfile();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          Admin Profile
        </h1>
        <p className="text-sm mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Manage your account settings and view your activity history
        </p>
      </div>

      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        loading={loading}
        onProfilePictureUpload={uploadProfilePicture}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Edit Form */}
        <ProfileEditForm
          profile={profile}
          loading={loading}
          onUpdateProfile={updateProfile}
        />

        {/* Password Change Form */}
        <PasswordChangeForm
          loading={loading}
          onChangePassword={changePassword}
        />
      </div>
    </div>
  );
}