import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { listFiles } from '../../../api/files';
import { listJobs } from '../../../api/jobs';
import { EmptyState, Skeleton } from '../../../components/ui';
import type { File as AppFile, Job, JobStatus } from '../../../types/domain';
import { queryKeys } from '../../../utils/queryKeys';
import { JobRow } from './JobRow';

const LIMIT = 20;

interface JobListProps {
  status: JobStatus | undefined;
  page: number;
  onPageChange: (page: number) => void;
}

interface EmptyConfig {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

function getEmptyState(status: JobStatus | undefined, onConvert: () => void): EmptyConfig {
  switch (status) {
    case 'active':
      return { title: 'No jobs running', description: 'Start a conversion or compression' };
    case 'completed':
      return { title: 'No completed jobs', description: '' };
    case 'failed':
      return { title: 'No failed jobs', description: 'Looks like everything worked!' };
    default:
      return {
        title: 'Nothing here yet',
        description: 'Your processed jobs will appear here',
        action: { label: 'Convert a file →', onClick: onConvert },
      };
  }
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
      />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton height={14} className="w-3/5" />
            <Skeleton height={11} className="w-1/4" />
          </div>
          <Skeleton height={20} width={80} className="rounded-full" />
          <Skeleton height={12} width={80} />
          <Skeleton height={28} width={24} />
        </div>
      ))}
    </div>
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
    return <SkeletonRows />;
  }

  if (jobsQuery.isError) {
    return <p className="py-10 text-center text-sm text-danger">Failed to load jobs.</p>;
  }

  if (jobs.length === 0) {
    const { title, description, action } = getEmptyState(status, () => navigate('/app/convert'));
    const icon = status === 'failed' ? <ShieldCheckIcon /> : <InboxIcon />;
    return <EmptyState icon={icon} title={title} description={description} action={action} />;
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
