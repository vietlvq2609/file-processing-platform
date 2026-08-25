import { Button, ProgressBar, Spinner } from '../../../components/ui';
import type { JobStatus } from '../../../types/domain';

interface ProcessingStepProps {
  progress: number;
  status: JobStatus;
  error: string | null;
  onReset: () => void;
}

export function ProcessingStep({ progress, status, error, onReset }: ProcessingStepProps) {
  if (status === 'failed' || error) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-medium text-red-600">Conversion failed</p>
        {error && <p className="text-sm text-gray-500">{error}</p>}
        <Button variant="secondary" onClick={onReset}>
          Try again
        </Button>
      </div>
    );
  }

  const isPending = status === 'pending' && progress === 0;

  return (
    <div className="space-y-4">
      {isPending ? (
        <div className="flex items-center justify-center gap-3 py-4">
          <Spinner size="md" />
          <span className="text-sm text-gray-500">Starting conversion…</span>
        </div>
      ) : (
        <>
          <ProgressBar value={progress} animated variant="default" />
          <p className="text-center text-sm text-gray-500">
            {progress > 80 ? 'Almost done…' : 'Converting your file…'}
          </p>
        </>
      )}
    </div>
  );
}
