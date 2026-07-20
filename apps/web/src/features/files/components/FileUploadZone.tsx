import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { useUploadFile } from '../hooks/useUploadFile';

export default function FileUploadZone() {
  const { mutate: upload, isPending } = useUploadFile();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => upload(file));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    e.target.value = '';
  }

  return (
    <div
      onClick={() => !isPending && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${isDragging ? '#4299e1' : '#cbd5e0'}`,
        borderRadius: 8,
        padding: '32px 16px',
        textAlign: 'center',
        cursor: isPending ? 'wait' : 'pointer',
        marginBottom: 24,
        background: isDragging ? '#ebf8ff' : '#f7fafc',
        transition: 'border-color 0.15s, background 0.15s',
        userSelect: 'none',
      }}
    >
      <input ref={inputRef} type="file" multiple hidden onChange={onChange} />
      {isPending ? (
        <p style={{ margin: 0, color: '#718096' }}>Uploading…</p>
      ) : (
        <p style={{ margin: 0, color: '#718096' }}>
          Drag &amp; drop files here, or{' '}
          <span style={{ color: '#4299e1', fontWeight: 600 }}>click to browse</span>
        </p>
      )}
    </div>
  );
}
