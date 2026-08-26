import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { uploadFile } from '../../../api/files';
import { createJob } from '../../../api/jobs';
import { useJobWebSocket } from '../../../hooks/useJobWebSocket';
import type { JobStatus } from '../../../types/domain';

export type CompressStep = 'idle' | 'options' | 'processing' | 'done' | 'error';

interface CompressFlowState {
  step: CompressStep;
  selectedFile: File | null;
  quality: number;
  uploadedFileId: string | null;
  jobId: string | null;
  uploadProgress: number;
}

export interface UseCompressFlowReturn {
  step: CompressStep;
  selectedFile: File | null;
  quality: number;
  setQuality: (q: number) => void;
  progress: number;
  wsStatus: JobStatus;
  wsError: string | null;
  outputFileId: string | null;
  isUploading: boolean;
  isSubmitting: boolean;
  uploadProgress: number;
  onFileSelected: (files: File[]) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const INITIAL_STATE: CompressFlowState = {
  step: 'idle',
  selectedFile: null,
  quality: 80,
  uploadedFileId: null,
  jobId: null,
  uploadProgress: 0,
};

export function useCompressFlow(): UseCompressFlowReturn {
  const [flow, setFlow] = useState<CompressFlowState>(INITIAL_STATE);

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
    mutationFn: ({ fileId, quality }: { fileId: string; quality: number }) =>
      createJob(fileId, 'compress', { quality }),
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

  const effectiveStep: CompressStep = (() => {
    if (flow.step === 'processing') {
      if (wsState.status === 'completed') return 'done';
      if (wsState.status === 'failed') return 'error';
    }
    return flow.step;
  })();

  const onFileSelected = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setFlow({ ...INITIAL_STATE, selectedFile: file });
    uploadMutation.mutate(file);
  };

  const onSubmit = () => {
    const { uploadedFileId, quality } = flow;
    if (!uploadedFileId) return;
    jobMutation.mutate({ fileId: uploadedFileId, quality });
  };

  const onReset = () => {
    setFlow(INITIAL_STATE);
  };

  return {
    step: effectiveStep,
    selectedFile: flow.selectedFile,
    quality: flow.quality,
    setQuality: (q) => setFlow((prev) => ({ ...prev, quality: q })),
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
