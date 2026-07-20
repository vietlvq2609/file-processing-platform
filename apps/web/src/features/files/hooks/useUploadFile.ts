import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadFile } from '../../../api/files'
import { queryKeys } from '../../../utils/queryKeys'

export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: globalThis.File) => uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files.all })
    },
  })
}
