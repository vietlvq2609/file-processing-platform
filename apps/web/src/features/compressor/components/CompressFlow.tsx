import { Card } from '../../../components/ui';
import { FileInputStep } from '../../shared/components/FileInputStep';
import { ProcessingStep } from '../../shared/components/ProcessingStep';
import { useCompressFlow } from '../hooks/useCompressFlow';
import { CompressOptionsStep } from './CompressOptionsStep';
import { CompressResultStep } from './CompressResultStep';

export function CompressFlow() {
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

  return (
    <Card>
      <div className="p-6">
        {(step === 'idle' || isUploading) && (
          <FileInputStep onFiles={onFileSelected} isUploading={isUploading} />
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
          <CompressResultStep
            outputFileId={outputFileId}
            originalFile={selectedFile}
            onReset={onReset}
          />
        )}
      </div>
    </Card>
  );
}
