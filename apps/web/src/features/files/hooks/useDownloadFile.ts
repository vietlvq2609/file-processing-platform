import { useMutation } from '@tanstack/react-query';

import { downloadFile } from '../../../api/files';

export function useDownloadFile() {
  return useMutation({
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
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
