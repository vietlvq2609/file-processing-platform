import { useEffect, useRef, useState } from 'react';

import { useAuthStore } from '../stores/authStore';
import type { JobStatus } from '../types/domain';

export interface JobWsState {
  progress: number;
  status: JobStatus;
  error: string | null;
  outputFileId: string | null;
}

/**
 * Opens a WebSocket connection to the API and subscribes to real-time events
 * for the given jobId. Automatically unsubscribes and closes on unmount or
 * when the job reaches a terminal state (completed / failed).
 */
export function useJobWebSocket(
  jobId: string | null,
  initial: { progress: number; status: JobStatus }
): JobWsState {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [state, setState] = useState<JobWsState>({
    progress: initial.progress,
    status: initial.status,
    error: null,
    outputFileId: null,
  });

  // Keep a stable ref so the cleanup function always has access to the socket.
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const isTerminal = state.status === 'completed' || state.status === 'failed';
    if (!jobId || !accessToken || isTerminal) return;

    const wsBase =
      import.meta.env.VITE_WS_URL ??
      (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host;
    const url = `${wsBase}/ws?token=${encodeURIComponent(accessToken)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', jobId }));
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      let msg: {
        type: string;
        jobId?: string;
        progress?: number;
        status?: JobStatus;
        error?: string;
        outputFileId?: string;
      };
      try {
        msg = JSON.parse(event.data) as typeof msg;
      } catch {
        return;
      }

      if (msg.jobId !== jobId) return;

      if (msg.type === 'job:progress') {
        setState({
          progress: msg.progress ?? 0,
          status: msg.status ?? 'active',
          error: null,
          outputFileId: null,
        });
      } else if (msg.type === 'job:completed') {
        setState({
          progress: 100,
          status: 'completed',
          error: null,
          outputFileId: msg.outputFileId ?? null,
        });
      } else if (msg.type === 'job:failed') {
        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: msg.error ?? 'Processing failed',
        }));
      }
    };

    ws.onerror = () => {
      setState((prev) => ({
        ...prev,
        error: 'WebSocket connection error. Progress updates may be delayed.',
      }));
    };

    return () => {
      wsRef.current = null;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', jobId }));
        ws.close();
      } else if (ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
    // Re-run when job becomes terminal to stop the connection.
  }, [jobId, accessToken, state.status]);

  return state;
}
