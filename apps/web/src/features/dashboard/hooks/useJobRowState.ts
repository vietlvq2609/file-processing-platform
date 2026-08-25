import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useJobWebSocket } from '../../../hooks/useJobWebSocket';
import type { ApiListResponse } from '../../../types/api';
import type { Job, JobStatus } from '../../../types/domain';
import { queryKeys } from '../../../utils/queryKeys';

export interface JobRowState {
  liveStatus: JobStatus;
  liveProgress: number;
}

// Five-item recent jobs key used by RecentJobsFeed — kept in sync via setQueryData.
const RECENT_JOBS_KEY = { limit: 5, page: 1 } as const;

export function useJobRowState(job: Job): JobRowState {
  const queryClient = useQueryClient();
  const isActive = job.status === 'active';

  const wsState = useJobWebSocket(isActive ? job.id : null, {
    progress: job.progress,
    status: job.status,
  });

  // Propagate live WS updates back into the TanStack Query cache.
  useEffect(() => {
    if (!isActive) return;
    queryClient.setQueryData<ApiListResponse<Job>>(queryKeys.jobs.list(RECENT_JOBS_KEY), (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((j) =>
          j.id === job.id ? { ...j, progress: wsState.progress, status: wsState.status } : j
        ),
      };
    });
  }, [wsState.progress, wsState.status, job.id, isActive, queryClient]);

  return {
    liveStatus: isActive ? wsState.status : job.status,
    liveProgress: isActive ? wsState.progress : job.progress,
  };
}
