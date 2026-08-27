import { useMutation } from '@tanstack/react-query';

import { downloadFile } from '../../../api/files';
import { Button } from '../../../components/ui';
import { CompressOptionsStep } from '../../compressor/components/CompressOptionsStep';
import { useCompressFlow } from '../../compressor/hooks/useCompressFlow';
import { FileInputStep } from '../../converter/components/FileInputStep';
import { ProcessingStep } from '../../converter/components/ProcessingStep';

export function GuestCompressZone() {
  const {
    step,
    selectedFile,
    quality,
    setQuality,
    progress,
    wsStatus,
    wsError,
    outputFileId,
    isUploading,
    isSubmitting,
    onFileSelected,
    onSubmit,
    onReset,
  } = useCompressFlow();

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

  const outputName = selectedFile ? `compressed_${selectedFile.name}` : '';

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-8">
      {(step === 'idle' || isUploading) && (
        <FileInputStep
          onFiles={onFileSelected}
          isUploading={isUploading}
          accept="image/*,application/pdf,video/*"
        />
      )}

      {step === 'options' && selectedFile && (
        <CompressOptionsStep
          file={selectedFile}
          quality={quality}
          onQualityChange={setQuality}
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
          taskLabel="Compressing your file…"
          failureLabel="Compression failed"
        />
      )}

      {step === 'error' && (
        <ProcessingStep
          progress={0}
          status="failed"
          error={wsError ?? 'Compression failed'}
          onReset={onReset}
          taskLabel="Compressing your file…"
          failureLabel="Compression failed"
        />
      )}

      {step === 'done' && outputFileId && selectedFile && (
        <div className="space-y-6 text-center">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">Compression complete</p>
            <p className="text-sm text-gray-500">{selectedFile.name} → compressed</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            isLoading={downloadMutation.isPending}
            onClick={() => downloadMutation.mutate({ fileId: outputFileId, fileName: outputName })}
            className="w-full"
          >
            Download compressed file
          </Button>

          <button
            type="button"
            onClick={onReset}
            className="block w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Compress another file
          </button>
        </div>
      )}
    </div>
  );
}
