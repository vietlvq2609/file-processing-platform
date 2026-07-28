import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { File, Job } from '../../../types/domain';
import { formatBytes } from '../../../utils/formatBytes';
import { formatDate } from '../../../utils/formatDate';
import { getDownloadUrl } from '../../../api/files';
import { useDeleteFile } from '../hooks/useDeleteFile';
import { useSubmitJob } from '../hooks/useSubmitJob';
import JobProgressPanel from './JobProgressPanel';

interface FileDetailProps {
  file: File;
}

export default function FileDetail({ file }: FileDetailProps) {
  const navigate = useNavigate();
  const { mutate: remove, isPending: isDeleting } = useDeleteFile();
  const { mutate: submitJob, isPending: isSubmitting } = useSubmitJob();
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  function handleDelete() {
    remove(file.id, { onSuccess: () => navigate('/dashboard') });
  }

  function handleProcess() {
    submitJob(file.id, { onSuccess: (job) => setActiveJob(job) });
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{file.originalName}</h2>

      <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
        <tbody>
          {(
            [
              ['Status', file.status],
              ['Size', formatBytes(file.size)],
              ['Type', file.mimeType],
              ['Uploaded', formatDate(file.createdAt)],
              ['Last updated', formatDate(file.updatedAt)],
              ['ID', file.id],
            ] as [string, string][]
          ).map(([label, value]) => (
            <tr key={label}>
              <td
                style={{
                  color: '#718096',
                  paddingRight: 24,
                  paddingBottom: 8,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </td>
              <td
                style={{ paddingBottom: 8, fontFamily: label === 'ID' ? 'monospace' : undefined }}
              >
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href={getDownloadUrl(file.id)} download={file.originalName}>
          <button>Download original</button>
        </a>
        {!activeJob && (
          <button
            onClick={handleProcess}
            disabled={isSubmitting}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              background: '#3182ce',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: isSubmitting ? 'wait' : 'pointer',
              fontWeight: 600,
            }}
          >
            {isSubmitting ? 'Submitting…' : 'Process file'}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{ color: '#e53e3e', cursor: isDeleting ? 'wait' : 'pointer' }}
        >
          {isDeleting ? 'Deleting…' : 'Delete file'}
        </button>
      </div>

      {activeJob && <JobProgressPanel job={activeJob} />}
    </div>
  );
}
