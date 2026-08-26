import { useMutation } from '@tanstack/react-query';

import { downloadFile } from '../../../api/files';
import { Button } from '../../../components/ui';
import { formatBytes } from '../../../utils/formatBytes';
import { ConvertOptionsStep } from '../../converter/components/ConvertOptionsStep';
import { FileInputStep } from '../../converter/components/FileInputStep';
import { ProcessingStep } from '../../converter/components/ProcessingStep';
import { useConvertFlow } from '../../converter/hooks/useConvertFlow';
import { useFormatOptions } from '../../converter/hooks/useFormatOptions';

export function GuestConvertZone() {
  const {
    step,
    selectedFile,
    selectedFormat,
    setSelectedFormat,
    progress,
    wsStatus,
    wsError,
    outputFileId,
    isUploading,
    isSubmitting,
    onFileSelected,
    onSubmit,
    onReset,
  } = useConvertFlow();

  const formats = useFormatOptions(selectedFile?.type ?? '');

  const downloadMutation = useMutation({
    mutationFn: async ({ fileId, fileName }: { fileId: string; fileName: string }) => {
      const blob = await downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });

  const outputName = selectedFile
    ? `${selectedFile.name.replace(/\.[^.]+$/, '')}.${selectedFormat.toLowerCase()}`
    : '';

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-8">
      {(step === 'idle' || isUploading) && (
        <FileInputStep onFiles={onFileSelected} isUploading={isUploading} />
      )}

      {step === 'options' && selectedFile && (
        <ConvertOptionsStep
          file={selectedFile}
          formats={formats}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          onSubmit={onSubmit}
          onClear={onReset}
          isPending={isSubmitting}
        />
      )}

      {step === 'processing' && (
        <ProcessingStep
          progress={progress}
          status={wsStatus}
          error={wsError}
          onReset={onReset}
          taskLabel="Converting your file…"
          failureLabel="Conversion failed"
        />
      )}

      {step === 'error' && (
        <ProcessingStep
          progress={0}
          status="failed"
          error={wsError ?? 'Conversion failed'}
          onReset={onReset}
          taskLabel="Converting your file…"
          failureLabel="Conversion failed"
        />
      )}

      {step === 'done' && outputFileId && selectedFile && (
        <div className="space-y-6 text-center">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">Conversion complete</p>
            <p className="text-sm text-gray-500">
              {selectedFile.name} → {outputName} &middot; {formatBytes(selectedFile.size)}
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            isLoading={downloadMutation.isPending}
            onClick={() => downloadMutation.mutate({ fileId: outputFileId, fileName: outputName })}
            className="w-full"
          >
            Download converted file
          </Button>

          <button
            type="button"
            onClick={onReset}
            className="block w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Convert another file
          </button>
        </div>
      )}
    </div>
  );
}
