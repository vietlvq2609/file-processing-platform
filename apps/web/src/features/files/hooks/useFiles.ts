import { useQuery } from '@tanstack/react-query';
import { listFiles, type ListFilesParams } from '../../../api/files';
import { queryKeys } from '../../../utils/queryKeys';

export function useFiles(params?: ListFilesParams) {
  return useQuery({
    queryKey: queryKeys.files.list(params as Record<string, unknown> | undefined),
    queryFn: () => listFiles(params),
  });
}
