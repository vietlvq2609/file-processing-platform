import { useNavigate } from 'react-router-dom';

import FileDetail from '../features/files/components/FileDetail';
import { useFile } from '../features/files/hooks/useFile';
import { useRequiredParam } from '../hooks/useRequiredParam';

export default function FileDetailPage() {
  const id = useRequiredParam('id');
  const navigate = useNavigate();
  const { data: file, isLoading, isError } = useFile(id);

  if (isLoading)
    return (
      <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
        <p style={{ color: '#718096' }}>Loading…</p>
      </main>
    );

  if (isError || !file)
    return (
      <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
        <p style={{ color: '#e53e3e' }}>File not found.</p>
        <button onClick={() => navigate('/dashboard')}>← Back to files</button>
      </main>
    );

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginBottom: 24,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#4299e1',
          padding: 0,
        }}
      >
        ← Back to files
      </button>
      <FileDetail file={file} />
    </main>
  );
}
