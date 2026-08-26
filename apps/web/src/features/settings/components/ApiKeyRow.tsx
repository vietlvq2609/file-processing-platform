import { Button } from '../../../components/ui/Button';
import type { ApiKey } from '../../../types/domain';

interface ApiKeyRowProps {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function ApiKeyRow({ apiKey, onRevoke, isRevoking }: ApiKeyRowProps) {
  const masked = `${apiKey.keyPrefix}${'•'.repeat(16)}${apiKey.lastFour}`;
  const age = relativeDate(apiKey.createdAt);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-gray-50 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm text-text-primary">{masked}</p>
        <p className="mt-0.5 text-xs text-text-muted">Created {age}</p>
      </div>
      <Button variant="danger" size="sm" onClick={() => onRevoke(apiKey.id)} isLoading={isRevoking}>
        Revoke
      </Button>
    </div>
  );
}
