import { useQuery } from '@tanstack/react-query';

import { listJobs, type ListJobsParams } from '../../../api/jobs';
import { queryKeys } from '../../../utils/queryKeys';

export function useJobs(params?: ListJobsParams) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params as Record<string, unknown> | undefined),
    queryFn: () => listJobs(params),
  });
}
