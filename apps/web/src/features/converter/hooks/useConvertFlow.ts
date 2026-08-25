import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { uploadFile } from '../../../api/files';
import { createJob } from '../../../api/jobs';
import { useJobWebSocket } from '../../../hooks/useJobWebSocket';
import { getFormatOptions } from './useFormatOptions';

export type ConvertStep = 'idle' | 'options' | 'processing' | 'done' | 'error';

interface ConvertFlowState {
  step: ConvertStep;
  selectedFile: File | null;
  selectedFormat: string;
  uploadedFileId: string | null;
  jobId: string | null;
  uploadProgress: number;
}

export interface UseConvertFlowReturn {
  step: ConvertStep;
  selectedFile: File | null;
  selectedFormat: string;
  setSelectedFormat: (fmt: string) => void;
  progress: number;
  wsStatus: import('../../../types/domain').JobStatus;
  wsError: string | null;
  outputFileId: string | null;
  isUploading: boolean;
  isSubmitting: boolean;
  uploadProgress: number;
  onFileSelected: (files: File[]) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const INITIAL_STATE: ConvertFlowState = {
  step: 'idle',
  selectedFile: null,
  selectedFormat: '',
  uploadedFileId: null,
  jobId: null,
  uploadProgress: 0,
};

export function useConvertFlow(): UseConvertFlowReturn {
  const [flow, setFlow] = useState<ConvertFlowState>(INITIAL_STATE);

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadFile(file, (pct) => setFlow((prev) => ({ ...prev, uploadProgress: pct }))),
    onSuccess: (uploaded) => {
      setFlow((prev) => ({
        ...prev,
        step: 'options',
        uploadedFileId: uploaded.id,
        uploadProgress: 0,
      }));
    },
    onError: () => {
      setFlow((prev) => ({ ...prev, step: 'error' }));
    },
  });

  const jobMutation = useMutation({
    mutationFn: ({ fileId, type }: { fileId: string; type: string }) => createJob(fileId, type),
    onSuccess: (job) => {
      setFlow((prev) => ({ ...prev, step: 'processing', jobId: job.id }));
    },
    onError: () => {
      setFlow((prev) => ({ ...prev, step: 'error' }));
    },
  });

  const wsState = useJobWebSocket(flow.step === 'processing' ? flow.jobId : null, {
    progress: 0,
    status: 'pending',
  });

  // Derive effective step from stored step + live WebSocket status — no effect needed
  const effectiveStep: ConvertStep = (() => {
    if (flow.step === 'processing') {
      if (wsState.status === 'completed') return 'done';
      if (wsState.status === 'failed') return 'error';
    }
    return flow.step;
  })();

  const onFileSelected = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const formats = getFormatOptions(file.type);
    // Set the default format in the same state update as the file selection
    setFlow({ ...INITIAL_STATE, selectedFile: file, selectedFormat: formats[0] ?? '' });
    uploadMutation.mutate(file);
  };

  const onSubmit = () => {
    const { uploadedFileId, selectedFormat } = flow;
    if (!uploadedFileId || !selectedFormat) return;
    jobMutation.mutate({ fileId: uploadedFileId, type: selectedFormat.toLowerCase() });
  };

  const onReset = () => {
    setFlow(INITIAL_STATE);
  };

  return {
    step: effectiveStep,
    selectedFile: flow.selectedFile,
    selectedFormat: flow.selectedFormat,
    setSelectedFormat: (fmt) => setFlow((prev) => ({ ...prev, selectedFormat: fmt })),
    progress: wsState.progress,
    wsStatus: wsState.status,
    wsError: wsState.error,
    outputFileId: wsState.outputFileId,
    isUploading: uploadMutation.isPending,
    isSubmitting: jobMutation.isPending,
    uploadProgress: flow.uploadProgress,
    onFileSelected,
    onSubmit,
    onReset,
  };
}
