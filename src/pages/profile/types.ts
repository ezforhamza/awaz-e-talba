export interface AdminProfile {
  id: string;
  name: string;
  profilePicture?: string;
}

export interface ProfileUpdateData {
  name: string;
  profilePicture?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}