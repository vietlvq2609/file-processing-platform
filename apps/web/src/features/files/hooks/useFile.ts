import { useQuery } from '@tanstack/react-query'
import { getFile } from '../../../api/files'
import { queryKeys } from '../../../utils/queryKeys'

export function useFile(id: string) {
  return useQuery({
    queryKey: queryKeys.files.detail(id),
    queryFn: () => getFile(id),
    enabled: Boolean(id),
  })
}
