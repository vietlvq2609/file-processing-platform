import { useState } from 'react';

import { EmptyState, Skeleton } from '../../../components/ui';
import { useDebounce } from '../../../hooks/useDebounce';
import { useFiles } from '../hooks/useFiles';
import FileCard from './FileCard';

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton height={16} className="w-1/2" />
            <Skeleton height={12} className="w-2/3" />
            <Skeleton height={16} width={50} className="rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton height={28} width={72} className="rounded" />
            <Skeleton height={28} width={52} className="rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FileList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useFiles({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
  });

  return (
    <div>
      <input
        type="search"
        placeholder="Search files…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-4 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
      />

      {isLoading && <SkeletonCards />}
      {isError && <p className="text-red-500">Failed to load files.</p>}

      {!isLoading && data?.data.length === 0 && (
        <EmptyState
          icon={<FolderIcon />}
          title="No files uploaded"
          description="Upload a file to get started"
          action={{
            label: 'Upload a file →',
            onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
          }}
        />
      )}

      {data?.data.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {page} of {data.meta.totalPages} &middot; {data.meta.total} files
          </span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.meta.totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
