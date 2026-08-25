import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useJobWebSocket } from '../../../hooks/useJobWebSocket';
import type { ApiListResponse } from '../../../types/api';
import type { Job, JobStatus } from '../../../types/domain';
import { queryKeys } from '../../../utils/queryKeys';

export interface JobPageRowState {
  liveStatus: JobStatus;
  liveProgress: number;
}

// Adapts useJobRowState to target the jobs-page cache key (status+page) instead of the dashboard key.
export function useJobPageRowState(
  job: Job,
  listStatus: JobStatus | undefined,
  listPage: number
): JobPageRowState {
  const queryClient = useQueryClient();
  const isActive = job.status === 'active';

  const wsState = useJobWebSocket(isActive ? job.id : null, {
    progress: job.progress,
    status: job.status,
  });

  useEffect(() => {
    if (!isActive) return;
    const params = { status: listStatus, page: listPage, limit: 20 } as Record<string, unknown>;
    queryClient.setQueryData<ApiListResponse<Job>>(queryKeys.jobs.list(params), (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((j) =>
          j.id === job.id ? { ...j, progress: wsState.progress, status: wsState.status } : j
        ),
      };
    });
  }, [wsState.progress, wsState.status, job.id, isActive, queryClient, listStatus, listPage]);

  return {
    liveStatus: isActive ? wsState.status : job.status,
    liveProgress: isActive ? wsState.progress : job.progress,
  };
}
