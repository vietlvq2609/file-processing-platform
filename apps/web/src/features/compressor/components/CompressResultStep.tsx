import { Link } from 'react-router-dom';

import { Button, Spinner } from '../../../components/ui';
import { useDownloadFile } from '../../files/hooks/useDownloadFile';
import { useFile } from '../../files/hooks/useFile';
import { SizeComparison } from './SizeComparison';

interface CompressResultStepProps {
  outputFileId: string;
  originalFile: File;
  onReset: () => void;
}

export function CompressResultStep({
  outputFileId,
  originalFile,
  onReset,
}: CompressResultStepProps) {
  const { data: outputFile, isLoading } = useFile(outputFileId);
  const { mutate: download, isPending: isDownloading } = useDownloadFile();

  const outputName = `compressed_${originalFile.name}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-semibold text-gray-900">✓ Compression complete</p>

      {outputFile && (
        <SizeComparison originalSize={originalFile.size} outputSize={outputFile.size} />
      )}

      <Button
        variant="primary"
        size="lg"
        isLoading={isDownloading}
        onClick={() => download({ fileId: outputFileId, fileName: outputName })}
        className="w-full"
      >
        Download compressed file
      </Button>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onReset}
          className="block w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Compress another file
        </button>
        <Link to="/app/jobs" className="block text-sm text-indigo-600 hover:text-indigo-800">
          View in My Jobs →
        </Link>
      </div>
    </div>
  );
}
