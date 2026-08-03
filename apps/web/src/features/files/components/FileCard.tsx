import { Link } from 'react-router-dom';

import { getDownloadUrl } from '../../../api/files';
import type { File } from '../../../types/domain';
import { formatBytes } from '../../../utils/formatBytes';
import { formatDate } from '../../../utils/formatDate';
import { useDeleteFile } from '../hooks/useDeleteFile';

interface FileCardProps {
  file: File;
}

export default function FileCard({ file }: FileCardProps) {
  const { mutate: remove, isPending } = useDeleteFile();

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <Link
          to={`/files/${file.id}`}
          style={{ fontWeight: 600, textDecoration: 'none', color: 'inherit' }}
        >
          {file.originalName}
        </Link>
        <div style={{ color: '#718096', fontSize: 13, marginTop: 2 }}>
          {formatBytes(file.size)} &middot; {file.mimeType} &middot; {formatDate(file.createdAt)}
        </div>
        <span
          style={{
            display: 'inline-block',
            marginTop: 4,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: file.status === 'ready' ? '#c6f6d5' : '#feebc8',
            color: file.status === 'ready' ? '#276749' : '#7b341e',
            borderRadius: 4,
            padding: '2px 6px',
          }}
        >
          {file.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <a
          href={getDownloadUrl(file.id)}
          download={file.originalName}
          style={{ fontSize: 13, color: '#3182ce', textDecoration: 'none' }}
        >
          Download
        </a>
        <button
          onClick={() => remove(file.id)}
          disabled={isPending}
          style={{
            fontSize: 13,
            color: '#e53e3e',
            background: 'none',
            border: 'none',
            cursor: isPending ? 'wait' : 'pointer',
            padding: 0,
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
