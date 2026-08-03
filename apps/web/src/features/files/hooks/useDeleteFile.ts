import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteFile } from '../../../api/files';
import { queryKeys } from '../../../utils/queryKeys';

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files.all });
    },
  });
}
