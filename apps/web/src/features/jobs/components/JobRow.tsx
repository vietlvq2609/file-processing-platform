import { useEffect, useRef, useState } from 'react';

import { Badge, ProgressBar } from '../../../components/ui';
import type { Job, JobStatus } from '../../../types/domain';
import { useJobPageRowState } from '../hooks/useJobPageRowState';
import { JobRowActions } from './JobRowActions';

interface JobRowProps {
  job: Job;
  fileName: string;
  listStatus: JobStatus | undefined;
  listPage: number;
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

function timeAgo(isoStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const TRUNCATE_LEN = 32;

export function JobRow({ job, fileName, listStatus, listPage }: JobRowProps) {
  const { liveStatus, liveProgress } = useJobPageRowState(job, listStatus, listPage);

  // Re-render every 60 s to keep the relative timestamp current.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const prevStatusRef = useRef<JobStatus>(liveStatus);
  const [flashClass, setFlashClass] = useState('');
  useEffect(() => {
    if (prevStatusRef.current === liveStatus) return;
    prevStatusRef.current = liveStatus;

    let color = '';
    if (liveStatus === 'completed') color = 'bg-green-50';
    else if (liveStatus === 'failed') color = 'bg-red-50';
    if (!color) return;

    // Defer to avoid synchronous setState inside an effect body.
    const applyId = setTimeout(() => setFlashClass(color), 0);
    const clearId = setTimeout(() => setFlashClass(''), 2000);
    return () => {
      clearTimeout(applyId);
      clearTimeout(clearId);
    };
  }, [liveStatus]);

  const displayName =
    fileName.length > TRUNCATE_LEN ? `${fileName.slice(0, TRUNCATE_LEN)}…` : fileName;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 transition-colors duration-700 hover:bg-gray-50 ${flashClass}`}
    >
      {/* File name + operation type */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900" title={fileName}>
          {displayName}
        </p>
        <p className="mt-0.5 text-xs capitalize text-gray-400">{job.type}</p>
      </div>

      <div className="shrink-0">
        <Badge variant={STATUS_VARIANT[liveStatus]}>{STATUS_LABEL[liveStatus]}</Badge>
      </div>

      <div className="w-28 shrink-0">
        {liveStatus === 'active' ? (
          <ProgressBar value={liveProgress} animated />
        ) : (
          <span className="block text-right text-xs text-gray-400">{timeAgo(job.createdAt)}</span>
        )}
      </div>

      <JobRowActions job={job} liveStatus={liveStatus} />
    </div>
  );
}
