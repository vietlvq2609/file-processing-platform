import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';

interface FileDropZoneProps {
  onFiles: (files: File[]) => void;
  isPending?: boolean;
  accept?: string;
  multiple?: boolean;
  label?: string;
}

export default function FileDropZone({
  onFiles,
  isPending = false,
  accept,
  multiple = true,
  label = 'click to browse',
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    onFiles(Array.from(fileList));
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
      className={`mb-6 select-none rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors duration-150 ${
        isPending ? 'cursor-wait' : 'cursor-pointer'
      } ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        hidden
        onChange={onChange}
      />
      {isPending ? (
        <p className="m-0 text-gray-500">Uploading…</p>
      ) : (
        <p className="m-0 text-gray-500">
          Drag &amp; drop files here, or{' '}
          <span className="font-semibold text-blue-500">{label}</span>
        </p>
      )}
    </div>
  );
}
