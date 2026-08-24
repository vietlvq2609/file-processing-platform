import { useState } from 'react';

import { useDebounce } from '../../../hooks/useDebounce';
import { useFiles } from '../hooks/useFiles';
import FileCard from './FileCard';

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

      {isLoading && <p className="text-gray-500">Loading…</p>}
      {isError && <p className="text-red-500">Failed to load files.</p>}

      {data?.data.length === 0 && !isLoading && (
        <p className="px-0 py-8 text-center text-gray-500">No files yet.</p>
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
