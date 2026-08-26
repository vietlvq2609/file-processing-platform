import { Link, useNavigate } from 'react-router-dom';

import { Card, EmptyState, Skeleton } from '../../../components/ui';
import { useRecentJobs } from '../hooks/useRecentJobs';
import { BriefcaseIcon } from '../icons';
import { RecentJobRow } from './RecentJobRow';

function SkeletonFeedRows() {
  return (
    <div className="divide-y divide-gray-100 px-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton height={14} className="w-3/5" />
            <Skeleton height={11} className="w-1/4" />
          </div>
          <Skeleton height={20} width={72} className="rounded-full" />
          <Skeleton height={12} width={80} />
        </div>
      ))}
    </div>
  );
}

export function RecentJobsFeed() {
  const navigate = useNavigate();
  const { jobs, fileMap, isLoading } = useRecentJobs();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Recent Jobs</h2>
      <Card className="p-0">
        {isLoading ? (
          <SkeletonFeedRows />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<BriefcaseIcon />}
            title="No jobs yet"
            description="Process a file to see your activity here"
            action={{ label: 'Convert a file →', onClick: () => navigate('/app/convert') }}
          />
        ) : (
          <div className="divide-y divide-gray-100 px-6">
            {jobs.map((job) => (
              <RecentJobRow
                key={job.id}
                job={job}
                fileName={fileMap.get(job.fileId)?.originalName ?? 'Unknown file'}
              />
            ))}
          </div>
        )}

        {jobs.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-3">
            <Link
              to="/app/jobs"
              className="text-sm font-medium text-brand no-underline hover:underline"
            >
              View all jobs →
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
