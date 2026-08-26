import { useQuery } from '@tanstack/react-query';

import { listFiles } from '../../../api/files';
import { listJobs } from '../../../api/jobs';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { FREE_TIER_LIMITS } from '../../../constants/plans';
import { queryKeys } from '../../../utils/queryKeys';
import { QuotaBar } from './QuotaBar';

export function UsageTab() {
  // Fetch with limit=1 to get meta.total without loading all records
  const filesQuery = useQuery({
    queryKey: queryKeys.files.list({ limit: 1 }),
    queryFn: () => listFiles({ limit: 1 }),
  });

  const jobsQuery = useQuery({
    queryKey: queryKeys.jobs.list({ limit: 1 }),
    queryFn: () => listJobs({ limit: 1 }),
  });

  // Fetch all files to sum their sizes (up to page limit; good enough for free-tier counts)
  const allFilesQuery = useQuery({
    queryKey: queryKeys.files.list({ limit: 100 }),
    queryFn: () => listFiles({ limit: 100 }),
  });

  const fileCount = filesQuery.data?.meta.total ?? 0;
  const jobCount = jobsQuery.data?.meta.total ?? 0;
  const storageBytes = (allFilesQuery.data?.data ?? []).reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Plan: Free Tier</h2>
        </div>
        <p className="mb-6 text-sm text-text-secondary">Your current usage against plan limits.</p>

        <div className="space-y-5">
          <QuotaBar label="Files uploaded" used={fileCount} total={FREE_TIER_LIMITS.maxFiles} />
          <QuotaBar label="Jobs run" used={jobCount} total={FREE_TIER_LIMITS.maxJobsAllTime} />
          <QuotaBar
            label="Storage used"
            used={Math.round(storageBytes / (1024 * 1024))}
            total={Math.round(FREE_TIER_LIMITS.maxStorageBytes / (1024 * 1024))}
            unit="MB"
          />
        </div>
      </Card>

      <Card className="border-brand/20 bg-brand-light/40 p-6">
        <h3 className="mb-1 text-sm font-semibold text-text-primary">Need more? Upgrade to Pro.</h3>
        <p className="mb-4 text-sm text-text-secondary">
          Unlimited jobs · 10 GB storage · API access
        </p>
        <Button variant="primary" onClick={() => window.open('#', '_blank')}>
          Upgrade to Pro
        </Button>
      </Card>
    </div>
  );
}
