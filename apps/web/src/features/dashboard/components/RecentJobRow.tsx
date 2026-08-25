import { Badge, ProgressBar } from '../../../components/ui';
import type { Job, JobStatus } from '../../../types/domain';
import { useJobRowState } from '../hooks/useJobRowState';

interface RecentJobRowProps {
  job: Job;
  fileName: string;
}

function timeAgo(isoStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const STATUS_VARIANT: Record<JobStatus, 'default' | 'info' | 'success' | 'danger'> = {
  pending: 'default',
  active: 'info',
  completed: 'success',
  failed: 'danger',
};

const STATUS_LABEL: Record<JobStatus, string> = {
  pending: 'Pending',
  active: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export function RecentJobRow({ job, fileName }: RecentJobRowProps) {
  const { liveStatus, liveProgress } = useJobRowState(job);

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{fileName}</p>
        <p className="text-xs capitalize text-gray-400">{job.type}</p>
      </div>

      <Badge variant={STATUS_VARIANT[liveStatus]}>{STATUS_LABEL[liveStatus]}</Badge>

      <div className="w-28 shrink-0">
        {liveStatus === 'active' ? (
          <ProgressBar value={liveProgress} animated />
        ) : (
          <span className="text-right text-xs text-gray-400">{timeAgo(job.createdAt)}</span>
        )}
      </div>
    </div>
  );
}
