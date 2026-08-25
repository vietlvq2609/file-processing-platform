import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { listFiles } from '../../../api/files';
import { listJobs } from '../../../api/jobs';
import { EmptyState } from '../../../components/ui';
import type { File as AppFile, Job, JobStatus } from '../../../types/domain';
import { queryKeys } from '../../../utils/queryKeys';
import { JobRow } from './JobRow';

const LIMIT = 20;

interface JobListProps {
  status: JobStatus | undefined;
  page: number;
  onPageChange: (page: number) => void;
}

function getEmptyState(status: JobStatus | undefined) {
  switch (status) {
    case 'active':
      return {
        title: 'No jobs currently running',
        description: 'Active processing jobs will appear here.',
      };
    case 'completed':
      return {
        title: 'No completed jobs yet',
        description: 'Successfully processed jobs will appear here.',
      };
    case 'failed':
      return { title: 'No failed jobs', description: 'Failed processing jobs will appear here.' };
    default:
      return { title: 'No jobs yet', description: 'Convert or compress a file to get started.' };
  }
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

export function JobList({ status, page, onPageChange }: JobListProps) {
  const navigate = useNavigate();
  const listParams = { status, page, limit: LIMIT } as Record<string, unknown>;

  const jobsQuery = useQuery({
    queryKey: queryKeys.jobs.list(listParams),
    queryFn: () => listJobs({ status, page, limit: LIMIT }),
  });

  // Shares the same cache entry used by the dashboard — no extra network request.
  const filesQuery = useQuery({
    queryKey: queryKeys.files.list({ limit: 100 }),
    queryFn: () => listFiles({ limit: 100 }),
  });

  const jobs: Job[] = jobsQuery.data?.data ?? [];
  const meta = jobsQuery.data?.meta;
  const fileMap = new Map<string, AppFile>((filesQuery.data?.data ?? []).map((f) => [f.id, f]));

  if (jobsQuery.isLoading) {
    return <p className="py-10 text-center text-sm text-gray-400">Loading…</p>;
  }

  if (jobsQuery.isError) {
    return <p className="py-10 text-center text-sm text-danger">Failed to load jobs.</p>;
  }

  if (jobs.length === 0) {
    const { title, description } = getEmptyState(status);
    return (
      <EmptyState
        icon={<ClipboardIcon />}
        title={title}
        description={description}
        action={
          status === undefined
            ? { label: 'Convert a file', onClick: () => navigate('/app/convert') }
            : undefined
        }
      />
    );
  }

  return (
    <div>
      <div className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {jobs.map((job) => (
          <JobRow
            key={job.id}
            job={job}
            fileName={fileMap.get(job.fileId)?.originalName ?? job.fileId}
            listStatus={status}
            listPage={page}
          />
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {meta.totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= meta.totalPages}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
