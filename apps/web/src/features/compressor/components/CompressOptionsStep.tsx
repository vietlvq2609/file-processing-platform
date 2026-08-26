import { Button } from '../../../components/ui';
import { formatBytes } from '../../../utils/formatBytes';
import { QualitySlider } from './QualitySlider';

interface CompressOptionsStepProps {
  file: File;
  quality: number;
  onQualityChange: (value: number) => void;
  onSubmit: () => void;
  onClear: () => void;
  isPending: boolean;
}

export function CompressOptionsStep({
  file,
  quality,
  onQualityChange,
  onSubmit,
  onClear,
  isPending,
}: CompressOptionsStepProps) {
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

      <QualitySlider value={quality} onChange={onQualityChange} />

      <Button variant="primary" onClick={onSubmit} isLoading={isPending} className="w-full">
        Compress Now
      </Button>
    </div>
  );
}
