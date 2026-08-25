import { Link } from 'react-router-dom';

import type { Job, JobStatus } from '../../../types/domain';
import { useDownloadFile } from '../../files/hooks/useDownloadFile';

interface JobRowActionsProps {
  job: Job;
  liveStatus: JobStatus;
}

export function JobRowActions({ job, liveStatus }: JobRowActionsProps) {
  const { mutate: download, isPending } = useDownloadFile();

  return (
    <div className="flex shrink-0 items-center gap-2">
      {liveStatus === 'completed' && (
        <button
          onClick={() =>
            download({ fileId: job.fileId, fileName: `job-${job.id.slice(0, 8)}-result` })
          }
          disabled={isPending}
          className={`animate-[fade-in_200ms_ease-out_forwards] rounded-md bg-brand px-3 py-1 text-xs font-semibold text-white transition-opacity ${
            isPending ? 'cursor-wait opacity-50' : 'cursor-pointer hover:opacity-90'
          }`}
        >
          {isPending ? 'Downloading…' : 'Download'}
        </button>
      )}
      <Link
        to={`/app/files/${job.fileId}`}
        className="text-xs font-medium text-gray-500 hover:text-brand hover:underline"
      >
        View File
      </Link>
    </div>
  );
}
