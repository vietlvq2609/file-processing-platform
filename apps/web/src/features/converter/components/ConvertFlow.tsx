import { Card } from '../../../components/ui';
import { useConvertFlow } from '../hooks/useConvertFlow';
import { useFormatOptions } from '../hooks/useFormatOptions';
import { ConvertOptionsStep } from './ConvertOptionsStep';
import { DownloadStep } from './DownloadStep';
import { FileInputStep } from './FileInputStep';
import { ProcessingStep } from './ProcessingStep';

export function ConvertFlow() {
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

  return (
    <Card>
      <div className="p-6">
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
          <ProcessingStep progress={progress} status={wsStatus} error={wsError} onReset={onReset} />
        )}

        {step === 'error' && (
          <ProcessingStep
            progress={0}
            status="failed"
            error={wsError ?? 'Conversion failed'}
            onReset={onReset}
          />
        )}

        {step === 'done' && outputFileId && selectedFile && (
          <DownloadStep
            outputFileId={outputFileId}
            originalFile={selectedFile}
            selectedFormat={selectedFormat}
            onReset={onReset}
          />
        )}
      </div>
    </Card>
  );
}
