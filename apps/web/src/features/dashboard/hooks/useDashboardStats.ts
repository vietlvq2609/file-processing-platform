import { useQuery } from '@tanstack/react-query';

import { listFiles } from '../../../api/files';
import { listJobs } from '../../../api/jobs';
import { queryKeys } from '../../../utils/queryKeys';

export interface DashboardStats {
  fileCount: number | null;
  jobCount: number | null;
  storageBytes: number | null;
}

export function useDashboardStats(): DashboardStats {
  const filesQuery = useQuery({
    queryKey: queryKeys.files.list({ limit: 100 }),
    queryFn: () => listFiles({ limit: 100 }),
  });

  const jobsQuery = useQuery({
    queryKey: queryKeys.jobs.list({ limit: 1 }),
    queryFn: () => listJobs({ limit: 1 }),
  });

  const fileCount = filesQuery.data?.meta.total ?? null;
  const jobCount = jobsQuery.data?.meta.total ?? null;
  const storageBytes = filesQuery.data
    ? filesQuery.data.data.reduce((sum, f) => sum + f.size, 0)
    : null;

  return { fileCount, jobCount, storageBytes };
}
