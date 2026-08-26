import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createApiKey, listApiKeys, revokeApiKey } from '../../../api/apiKeys';
import { queryKeys } from '../../../utils/queryKeys';

export function useApiKeys() {
  const queryClient = useQueryClient();

  const keysQuery = useQuery({
    queryKey: queryKeys.apiKeys.list(),
    queryFn: listApiKeys,
  });

  const createMutation = useMutation({
    mutationFn: createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
    },
  });

  return { keysQuery, createMutation, revokeMutation };
}
