import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';

import { Spinner } from './Spinner';

interface FileDropZoneProps {
  onFiles: (files: File[]) => void;
  isPending?: boolean;
  accept?: string;
  multiple?: boolean;
  label?: string;
}

export function FileDropZone({
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
      } ${isDragging ? 'border-brand bg-brand-light' : 'border-border bg-gray-50'}`}
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
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Spinner size="sm" />
          <p className="m-0 text-sm">Uploading…</p>
        </div>
      ) : (
        <p className="m-0 text-sm text-gray-500">
          Drag &amp; drop files here, or <span className="font-semibold text-brand">{label}</span>
        </p>
      )}
    </div>
  );
}
