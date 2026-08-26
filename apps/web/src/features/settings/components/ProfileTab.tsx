import { Card } from '../../../components/ui/Card';
import { useAuthStore } from '../../../stores/authStore';
import { ChangePasswordForm } from './ChangePasswordForm';

export function ProfileTab() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-text-primary">Account</h2>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Email</p>
          <p className="text-sm text-text-primary">{user?.email ?? '—'}</p>
        </div>
      </Card>

      <Card className="p-6">
        <ChangePasswordForm />
      </Card>

      <Card className="border-danger/30 p-6">
        <h2 className="mb-1 text-base font-semibold text-danger">Danger zone</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Permanently delete your account and all associated data.
        </p>
        <button
          disabled
          className="cursor-not-allowed rounded-lg border border-danger/40 px-4 py-2 text-sm font-medium text-danger/40"
        >
          Delete account — coming soon
        </button>
      </Card>
    </div>
  );
}
