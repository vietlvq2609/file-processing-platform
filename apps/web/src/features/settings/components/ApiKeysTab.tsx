import { useState } from 'react';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import type { ApiKey } from '../../../types/domain';
import { useApiKeys } from '../hooks/useApiKeys';
import { ApiKeyRow } from './ApiKeyRow';

export function ApiKeysTab() {
  const { keysQuery, createMutation, revokeMutation } = useApiKeys();
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{
    key: ApiKey;
    fullKey: string;
  } | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Graceful fallback when backend endpoint is unavailable
  if (keysQuery.error) {
    return (
      <Card className="p-6 text-center">
        <p className="mb-2 font-medium text-text-primary">API key management coming soon</p>
        <p className="text-sm text-text-secondary">
          Upgrade to Pro to get programmatic API access.
        </p>
      </Card>
    );
  }

  async function handleCopy() {
    if (!newlyCreatedKey) return;
    await navigator.clipboard.writeText(newlyCreatedKey.fullKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleGenerate() {
    createMutation.mutate(undefined, {
      onSuccess: (result) => {
        setNewlyCreatedKey(result);
      },
    });
  }

  function handleRevokeConfirm() {
    if (!revokeTarget) return;
    revokeMutation.mutate(revokeTarget, {
      onSuccess: () => setRevokeTarget(null),
    });
  }

  const keys = keysQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">API Keys</h2>
            <p className="mt-0.5 text-sm text-text-secondary">
              Use these keys to access the FileProc API.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            isLoading={createMutation.isPending}
            disabled={keys.length >= 5}
          >
            + Generate new key
          </Button>
        </div>

        {/* Full key shown once immediately after generation */}
        {newlyCreatedKey && (
          <div className="mb-4 rounded-lg border border-brand/30 bg-brand-light/50 p-4">
            <p className="mb-1 text-xs font-medium text-brand">
              Copy this key now — it won&apos;t be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all font-mono text-sm text-text-primary">
                {newlyCreatedKey.fullKey}
              </code>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        )}

        {keysQuery.isLoading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-text-muted">No API keys yet.</p>
        ) : (
          <div className="space-y-2">
            {keys.map((key) => (
              <ApiKeyRow
                key={key.id}
                apiKey={key}
                onRevoke={(id) => setRevokeTarget(id)}
                isRevoking={revokeMutation.isPending && revokeMutation.variables === key.id}
              />
            ))}
          </div>
        )}

        {keys.length >= 5 && (
          <p className="mt-3 text-xs text-text-muted">
            Maximum of 5 API keys reached. Revoke one to generate a new key.
          </p>
        )}
      </Card>

      {/* Revoke confirmation modal */}
      <Modal
        isOpen={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        title="Revoke API key"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRevokeTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRevokeConfirm}
              isLoading={revokeMutation.isPending}
            >
              Revoke
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary">
          This key will be permanently revoked. Any applications using it will lose access
          immediately. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
