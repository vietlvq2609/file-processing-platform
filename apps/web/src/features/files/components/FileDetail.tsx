import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getDownloadUrl } from '../../../api/files';
import type { File, Job } from '../../../types/domain';
import { formatBytes } from '../../../utils/formatBytes';
import { formatDate } from '../../../utils/formatDate';
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
      <h2 className="mt-0">{file.originalName}</h2>

      <table className="border-collapse text-sm">
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
              <td className="whitespace-nowrap pb-2 pr-6 text-gray-500">{label}</td>
              <td className={`pb-2 ${label === 'ID' ? 'font-mono' : ''}`}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a href={getDownloadUrl(file.id)} download={file.originalName}>
          <button>Download original</button>
        </a>
        {!activeJob && (
          <button
            onClick={handleProcess}
            disabled={isSubmitting}
            className={`rounded-md border-none bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white ${isSubmitting ? 'cursor-wait' : 'cursor-pointer'}`}
          >
            {isSubmitting ? 'Submitting…' : 'Process file'}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`text-red-500 ${isDeleting ? 'cursor-wait' : 'cursor-pointer'}`}
        >
          {isDeleting ? 'Deleting…' : 'Delete file'}
        </button>
      </div>

      {activeJob && <JobProgressPanel job={activeJob} />}
    </div>
  );
}
