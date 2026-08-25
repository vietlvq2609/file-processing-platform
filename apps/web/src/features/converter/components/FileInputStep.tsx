import { FileDropZone, Spinner } from '../../../components/ui';

interface FileInputStepProps {
  onFiles: (files: File[]) => void;
  isUploading: boolean;
}

export function FileInputStep({ onFiles, isUploading }: FileInputStepProps) {
  return (
    <div className="space-y-3">
      <FileDropZone
        onFiles={onFiles}
        isPending={isUploading}
        accept="image/*,application/pdf,video/*,audio/*"
        label="Drop a file here, or click to select"
      />
      <p className="text-center text-sm text-gray-500">Max 50 MB</p>
      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Spinner size="sm" />
          Uploading…
        </div>
      )}
    </div>
  );
}
