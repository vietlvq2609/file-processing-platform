import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { JobStatus } from '../../../types/domain';

const VALID_STATUSES = new Set<string>(['active', 'completed', 'failed']);

function parseStatus(raw: string | null): JobStatus | undefined {
  if (raw && VALID_STATUSES.has(raw)) return raw as JobStatus;
  return undefined;
}

export interface JobsPageState {
  status: JobStatus | undefined;
  page: number;
  setStatus: (status: JobStatus | undefined) => void;
  setPage: (page: number) => void;
}

export function useJobsPageState(): JobsPageState {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPageState] = useState(1);

  const status = parseStatus(searchParams.get('status'));

  const setStatus = useCallback(
    (next: JobStatus | undefined) => {
      setPageState(1);
      setSearchParams((prev) => {
        const updated = new URLSearchParams(prev);
        if (next) {
          updated.set('status', next);
        } else {
          updated.delete('status');
        }
        return updated;
      });
    },
    [setSearchParams]
  );

  const setPage = useCallback((p: number) => setPageState(p), []);

  return { status, page, setStatus, setPage };
}
