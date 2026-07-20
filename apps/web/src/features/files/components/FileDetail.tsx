import { useNavigate } from 'react-router-dom'
import type { File } from '../../../types/domain'
import { formatBytes } from '../../../utils/formatBytes'
import { formatDate } from '../../../utils/formatDate'
import { getDownloadUrl } from '../../../api/files'
import { useDeleteFile } from '../hooks/useDeleteFile'

interface FileDetailProps {
  file: File
}

export default function FileDetail({ file }: FileDetailProps) {
  const navigate = useNavigate()
  const { mutate: remove, isPending } = useDeleteFile()

  function handleDelete() {
    remove(file.id, { onSuccess: () => navigate('/dashboard') })
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{file.originalName}</h2>

      <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
        <tbody>
          {([
            ['Status', file.status],
            ['Size', formatBytes(file.size)],
            ['Type', file.mimeType],
            ['Uploaded', formatDate(file.createdAt)],
            ['Last updated', formatDate(file.updatedAt)],
            ['ID', file.id],
          ] as [string, string][]).map(([label, value]) => (
            <tr key={label}>
              <td style={{ color: '#718096', paddingRight: 24, paddingBottom: 8, whiteSpace: 'nowrap' }}>{label}</td>
              <td style={{ paddingBottom: 8, fontFamily: label === 'ID' ? 'monospace' : undefined }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <a href={getDownloadUrl(file.id)} download={file.originalName}>
          <button>Download</button>
        </a>
        <button
          onClick={handleDelete}
          disabled={isPending}
          style={{ color: '#e53e3e', cursor: isPending ? 'wait' : 'pointer' }}
        >
          {isPending ? 'Deleting…' : 'Delete file'}
        </button>
      </div>
    </div>
  )
}
