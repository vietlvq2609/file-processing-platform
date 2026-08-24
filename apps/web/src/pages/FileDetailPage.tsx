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
      <main className="mx-auto mt-10 max-w-3xl px-4">
        <p className="text-gray-500">Loading…</p>
      </main>
    );

  if (isError || !file)
    return (
      <main className="mx-auto mt-10 max-w-3xl px-4">
        <p className="text-red-500">File not found.</p>
        <button onClick={() => navigate('/dashboard')}>← Back to files</button>
      </main>
    );

  return (
    <main className="mx-auto mt-10 max-w-3xl px-4">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 cursor-pointer border-none bg-transparent p-0 text-blue-500"
      >
        ← Back to files
      </button>
      <FileDetail file={file} />
    </main>
  );
}
