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
        style={{
          display: 'block',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: 16,
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          fontSize: 14,
        }}
      />

      {isLoading && <p style={{ color: '#718096' }}>Loading…</p>}
      {isError && <p style={{ color: '#e53e3e' }}>Failed to load files.</p>}

      {data?.data.length === 0 && !isLoading && (
        <p style={{ color: '#718096', textAlign: 'center', padding: 32 }}>No files yet.</p>
      )}

      {data?.data.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}

      {data && data.meta.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            Previous
          </button>
          <span style={{ fontSize: 13, color: '#718096' }}>
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
