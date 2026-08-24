import { useJobWebSocket } from '../../../hooks/useJobWebSocket';
import type { Job } from '../../../types/domain';
import { useDownloadFile } from '../hooks/useDownloadFile';

interface JobProgressPanelProps {
  job: Job;
}

const STATUS_LABEL: Record<Job['status'], string> = {
  pending: 'Queued',
  active: 'Processing…',
  completed: 'Completed',
  failed: 'Failed',
};

const STATUS_TEXT: Record<Job['status'], string> = {
  pending: 'text-gray-500',
  active: 'text-blue-600',
  completed: 'text-green-600',
  failed: 'text-red-500',
};

const BAR_BG: Record<Job['status'], string> = {
  pending: 'bg-gray-400',
  active: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export default function JobProgressPanel({ job }: JobProgressPanelProps) {
  const { progress, status, error } = useJobWebSocket(job.id, {
    progress: job.progress,
    status: job.status,
  });
  const { mutate: download, isPending: isDownloading, error: downloadError } = useDownloadFile();

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">Processing job</span>
        <span className={`text-[11px] font-bold uppercase tracking-wider ${STATUS_TEXT[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Progress bar track */}
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-in-out ${BAR_BG[status]}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-1.5 flex justify-between text-xs text-gray-500">
        <span>{progress}%</span>
        <span className="font-mono text-[11px]">job {job.id.slice(0, 8)}…</span>
      </div>

      {error && <p className="mb-0 mt-2.5 text-sm text-red-500">{error}</p>}
      {downloadError && (
        <p className="mb-0 mt-2.5 text-sm text-red-500">Download failed: {downloadError.message}</p>
      )}

      {status === 'completed' && (
        <div className="mt-3.5 flex gap-2">
          <button
            onClick={() =>
              download({ fileId: job.fileId, fileName: `job-${job.id.slice(0, 8)}-result` })
            }
            disabled={isDownloading}
            className={`rounded-md bg-green-600 px-4 py-1.5 text-xs font-semibold text-white ${isDownloading ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
          >
            {isDownloading ? 'Downloading...' : 'Download result'}
          </button>
          {downloadError && (
            <button
              onClick={() =>
                download({ fileId: job.fileId, fileName: `job-${job.id.slice(0, 8)}-result` })
              }
              disabled={isDownloading}
              className="text-xs font-semibold text-green-600 hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
