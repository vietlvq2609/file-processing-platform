export type FileStatus = 'pending' | 'ready' | 'deleted'

export interface File {
  id: string
  userId: string
  originalName: string
  mimeType: string
  size: number
  storagePath: string
  status: FileStatus
  createdAt: string
  updatedAt: string
}
