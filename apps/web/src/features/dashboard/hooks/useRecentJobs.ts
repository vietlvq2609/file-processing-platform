import { useQuery } from '@tanstack/react-query';

import { listFiles } from '../../../api/files';
import { listJobs } from '../../../api/jobs';
import type { File as AppFile, Job } from '../../../types/domain';
import { queryKeys } from '../../../utils/queryKeys';

export interface RecentJobsData {
  jobs: Job[];
  fileMap: Map<string, AppFile>;
  isLoading: boolean;
}

export function useRecentJobs(): RecentJobsData {
  const jobsQuery = useQuery({
    queryKey: queryKeys.jobs.list({ limit: 5, page: 1 }),
    queryFn: () => listJobs({ limit: 5, page: 1 }),
  });

  // Reuses the same cache entry as useDashboardStats — no extra network request.
  const filesQuery = useQuery({
    queryKey: queryKeys.files.list({ limit: 100 }),
    queryFn: () => listFiles({ limit: 100 }),
  });

  const jobs = jobsQuery.data?.data ?? [];
  const fileMap = new Map<string, AppFile>((filesQuery.data?.data ?? []).map((f) => [f.id, f]));

  return { jobs, fileMap, isLoading: jobsQuery.isLoading };
}
