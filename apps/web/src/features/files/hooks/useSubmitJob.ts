import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createJob } from '../../../api/jobs';
import { queryKeys } from '../../../utils/queryKeys';

export function useSubmitJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => createJob(fileId),
    onSuccess: (job) => {
      queryClient.setQueryData(queryKeys.jobs.detail(job.id), job);
    },
  });
}
