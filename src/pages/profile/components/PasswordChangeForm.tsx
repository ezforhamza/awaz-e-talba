import { useState } from 'react';
import { Icon } from "@/components/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import type { PasswordChangeData } from '../types';

interface PasswordChangeFormProps {
  loading: boolean;
  onChangePassword: (data: PasswordChangeData) => Promise<boolean>;
}

export function PasswordChangeForm({ loading, onChangePassword }: PasswordChangeFormProps) {
  const [formData, setFormData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      return;
    }

    setSubmitting(true);
    
    try {
      const success = await onChangePassword(formData);
      if (success) {
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Password change failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.currentPassword.length > 0 &&
      formData.newPassword.length >= 8 &&
      formData.newPassword === formData.confirmPassword
    );
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, text: 'Too weak', color: 'hsl(0 84% 60%)' };
    if (password.length < 8) return { strength: 1, text: 'Weak', color: 'hsl(25 95% 53%)' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 2, text: 'Fair', color: 'hsl(48 96% 53%)' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) return { strength: 3, text: 'Good', color: 'hsl(142 76% 36%)' };
    return { strength: 4, text: 'Strong', color: 'hsl(142 76% 30%)' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
          <Icon icon="solar:key-bold" className="w-5 h-5" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" style={{ color: 'hsl(var(--foreground))' }}>
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter your current password"
                disabled={loading || submitting}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility('current')}
                disabled={loading || submitting}
              >
                <Icon 
                  icon={showPasswords.current ? "solar:eye-bold" : "solar:eye-closed-bold"} 
                  className="w-4 h-4" 
                />
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" style={{ color: 'hsl(var(--foreground))' }}>
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                disabled={loading || submitting}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility('new')}
                disabled={loading || submitting}
              >
                <Icon 
                  icon={showPasswords.new ? "solar:eye-bold" : "solar:eye-closed-bold"} 
                  className="w-4 h-4" 
                />
              </Button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Password Strength
                  </span>
                  <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${(passwordStrength.strength + 1) * 20}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" style={{ color: 'hsl(var(--foreground))' }}>
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                disabled={loading || submitting}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={loading || submitting}
              >
                <Icon 
                  icon={showPasswords.confirm ? "solar:eye-bold" : "solar:eye-closed-bold"} 
                  className="w-4 h-4" 
                />
              </Button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="flex items-center gap-2 text-xs">
                {formData.newPassword === formData.confirmPassword ? (
                  <>
                    <Icon icon="solar:check-circle-bold" className="w-3 h-3" style={{ color: 'hsl(142 76% 36%)' }} />
                    <span style={{ color: 'hsl(142 76% 36%)' }}>Passwords match</span>
                  </>
                ) : (
                  <>
                    <Icon icon="solar:close-circle-bold" className="w-3 h-3" style={{ color: 'hsl(0 84% 60%)' }} />
                    <span style={{ color: 'hsl(0 84% 60%)' }}>Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>


          {/* Action Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={!isFormValid() || loading || submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <Icon icon="solar:refresh-outline" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon icon="solar:key-bold" className="w-4 h-4" />
              )}
              {submitting ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}