import { Link } from 'react-router-dom';

import { Button } from '../../../components/ui';
import { formatBytes } from '../../../utils/formatBytes';
import { useDownloadFile } from '../../files/hooks/useDownloadFile';

interface DownloadStepProps {
  outputFileId: string;
  originalFile: File;
  selectedFormat: string;
  onReset: () => void;
}

export function DownloadStep({
  outputFileId,
  originalFile,
  selectedFormat,
  onReset,
}: DownloadStepProps) {
  const { mutate: download, isPending } = useDownloadFile();

  const outputName = `${originalFile.name.replace(/\.[^.]+$/, '')}.${selectedFormat.toLowerCase()}`;

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-gray-900">Conversion complete</p>
        <p className="text-sm text-gray-500">
          {originalFile.name} → {outputName} &middot; {formatBytes(originalFile.size)}
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        isLoading={isPending}
        onClick={() => download({ fileId: outputFileId, fileName: outputName })}
        className="w-full"
      >
        Download converted file
      </Button>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onReset}
          className="block w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Convert another file
        </button>
        <Link to="/app/jobs" className="block text-sm text-indigo-600 hover:text-indigo-800">
          View in My Jobs →
        </Link>
      </div>
    </div>
  );
}
