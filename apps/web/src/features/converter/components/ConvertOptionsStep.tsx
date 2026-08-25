import { Button } from '../../../components/ui';
import { formatBytes } from '../../../utils/formatBytes';
import { FormatSelector } from './FormatSelector';

interface ConvertOptionsStepProps {
  file: File;
  formats: string[];
  selectedFormat: string;
  onFormatChange: (fmt: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isPending: boolean;
}

export function ConvertOptionsStep({
  file,
  formats,
  selectedFormat,
  onFormatChange,
  onSubmit,
  onClear,
  isPending,
}: ConvertOptionsStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3">
        <span className="truncate text-sm font-medium text-gray-800">
          {file.name}
          <span className="ml-2 font-normal text-gray-500">{formatBytes(file.size)}</span>
        </span>
        <button
          type="button"
          onClick={onClear}
          className="ml-4 shrink-0 text-sm text-gray-400 hover:text-gray-600"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Convert to</p>
        <FormatSelector formats={formats} value={selectedFormat} onChange={onFormatChange} />
      </div>

      <Button variant="primary" onClick={onSubmit} isLoading={isPending} className="w-full">
        Convert Now
      </Button>
    </div>
  );
}
