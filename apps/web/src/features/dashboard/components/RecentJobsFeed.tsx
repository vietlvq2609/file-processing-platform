import { Link, useNavigate } from 'react-router-dom';

import { Card, EmptyState } from '../../../components/ui';
import { useRecentJobs } from '../hooks/useRecentJobs';
import { BriefcaseIcon } from '../icons';
import { RecentJobRow } from './RecentJobRow';

export function RecentJobsFeed() {
  const navigate = useNavigate();
  const { jobs, fileMap, isLoading } = useRecentJobs();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Recent Jobs</h2>
      <Card className="p-0">
        {jobs.length === 0 && !isLoading ? (
          <EmptyState
            icon={<BriefcaseIcon />}
            title="No jobs yet"
            description="Upload a file and run your first conversion or compression."
            action={{ label: 'Convert your first file →', onClick: () => navigate('/app/convert') }}
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
