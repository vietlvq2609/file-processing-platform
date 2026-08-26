import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { File } from '../../../types/domain';
import { formatBytes } from '../../../utils/formatBytes';
import { formatDate } from '../../../utils/formatDate';
import { useDeleteFile } from '../hooks/useDeleteFile';
import { useDownloadFile } from '../hooks/useDownloadFile';

interface FileCardProps {
  file: File;
}

export default function FileCard({ file }: FileCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const { mutate: remove, isPending: isDeleting } = useDeleteFile();
  const { mutate: download, isPending: isDownloading, error: downloadError } = useDownloadFile();

  const handleDelete = () => {
    setIsRemoving(true);
    // Delay actual deletion to let the collapse animation play
    setTimeout(() => remove(file.id), 300);
  };

  return (
    <div
      className={`mb-2 overflow-hidden rounded-lg border border-gray-200 transition-all duration-300 ${
        isRemoving ? 'max-h-0 opacity-0' : 'max-h-48 opacity-100'
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <Link to={`/app/files/${file.id}`} className="font-semibold text-inherit no-underline">
            {file.originalName}
          </Link>
          <div className="mt-0.5 text-xs text-gray-500">
            {formatBytes(file.size)} &middot; {file.mimeType} &middot; {formatDate(file.createdAt)}
          </div>
          <span
            className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              file.status === 'ready'
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-900'
            }`}
          >
            {file.status}
          </span>
          {downloadError && (
            <div className="mt-2 text-xs text-red-600">
              Download failed: {downloadError.message}
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => download({ fileId: file.id, fileName: file.originalName })}
            disabled={isDownloading}
            className={`border-none bg-transparent p-0 text-sm text-blue-600 ${isDownloading ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
          {downloadError && (
            <button
              onClick={() => download({ fileId: file.id, fileName: file.originalName })}
              disabled={isDownloading}
              className="border-none bg-transparent p-0 text-sm text-blue-600 hover:underline"
            >
              Retry
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting || isRemoving}
            className={`border-none bg-transparent p-0 text-sm text-red-500 ${isDeleting || isRemoving ? 'cursor-wait' : 'cursor-pointer'}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
