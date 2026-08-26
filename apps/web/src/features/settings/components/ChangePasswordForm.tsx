import { useState } from 'react';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useChangePassword } from '../hooks/useChangePassword';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  const { mutate, isPending, isSuccess, error, reset } = useChangePassword();

  const serverErrorCode =
    error && 'response' in error
      ? (error as { response?: { data?: { error?: { code?: string } } } }).response?.data?.error
          ?.code
      : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setClientError(null);
    reset();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setClientError('All fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setClientError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setClientError('New passwords do not match.');
      return;
    }

    mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setClientError(null);
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Change Password</h3>

      <Input
        label="Current password"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        autoComplete="current-password"
      />
      <Input
        label="New password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        autoComplete="new-password"
      />
      <Input
        label="Confirm new password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
      />

      {clientError && <p className="text-sm text-danger">{clientError}</p>}

      {serverErrorCode === 'INVALID_CURRENT_PASSWORD' && (
        <p className="text-sm text-danger">Current password is incorrect.</p>
      )}

      {error && serverErrorCode !== 'INVALID_CURRENT_PASSWORD' && (
        <p className="text-sm text-danger">Something went wrong. Please try again.</p>
      )}

      {isSuccess && <p className="text-sm text-success">Password updated successfully.</p>}

      <Button type="submit" variant="primary" isLoading={isPending}>
        Update password
      </Button>
    </form>
  );
}
