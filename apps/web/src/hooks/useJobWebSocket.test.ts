import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '../stores/authStore';
import { useJobWebSocket } from './useJobWebSocket';

// ---------------------------------------------------------------------------
// Minimal WebSocket mock
// ---------------------------------------------------------------------------

type WsListener = (event: MessageEvent | Event) => void;

interface MockWs {
  readyState: number;
  onopen: WsListener | null;
  onmessage: WsListener | null;
  onerror: WsListener | null;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

let latestWs: MockWs | null = null;
let wsCallCount = 0;

function createMockWs(): MockWs {
  wsCallCount++;
  const ws: MockWs = {
    readyState: 0, // CONNECTING
    onopen: null,
    onmessage: null,
    onerror: null,
    send: vi.fn(),
    close: vi.fn(() => {
      ws.readyState = 3; // CLOSED
    }),
  };
  latestWs = ws;
  return ws;
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  latestWs = null;
  wsCallCount = 0;
  vi.stubGlobal(
    'WebSocket',
    vi.fn(() => createMockWs())
  );
  // Add static constants the hook reads from the WebSocket constructor.
  Object.assign(globalThis.WebSocket, { OPEN: 1, CONNECTING: 0, CLOSED: 3 });
  useAuthStore.getState().setAccessToken('test-token');
});

afterEach(() => {
  vi.unstubAllGlobals();
  useAuthStore.getState().clearAuth();
});

// Helper: open the WebSocket and send a subscribe message.
function openWs() {
  act(() => {
    latestWs!.readyState = 1; // WebSocket.OPEN
    latestWs!.onopen?.(new Event('open'));
  });
}

// Helper: simulate a message from the server.
function sendMessage(payload: object) {
  act(() => {
    latestWs!.onmessage?.(new MessageEvent('message', { data: JSON.stringify(payload) }));
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useJobWebSocket', () => {
  const JOB_ID = 'job-abc';
  const INITIAL = { progress: 0, status: 'pending' as const };

  it('returns the initial state before the socket opens', () => {
    const { result } = renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    expect(result.current).toEqual({ progress: 0, status: 'pending', error: null });
  });

  it('sends a subscribe message after the socket opens', () => {
    renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    openWs();
    expect(latestWs!.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'subscribe', jobId: JOB_ID })
    );
  });

  it('updates progress on job:progress messages', () => {
    const { result } = renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    openWs();

    sendMessage({ type: 'job:progress', jobId: JOB_ID, progress: 42, status: 'active' });
    expect(result.current.progress).toBe(42);
    expect(result.current.status).toBe('active');
    expect(result.current.error).toBeNull();
  });

  it('sets progress to 100 and status to completed on job:completed', () => {
    const { result } = renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    openWs();

    sendMessage({ type: 'job:completed', jobId: JOB_ID });
    expect(result.current.progress).toBe(100);
    expect(result.current.status).toBe('completed');
  });

  it('sets status to failed and stores the error on job:failed', () => {
    const { result } = renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    openWs();

    sendMessage({ type: 'job:failed', jobId: JOB_ID, error: 'disk full' });
    expect(result.current.status).toBe('failed');
    expect(result.current.error).toBe('disk full');
  });

  it('uses a default error message when job:failed carries no error field', () => {
    const { result } = renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    openWs();

    sendMessage({ type: 'job:failed', jobId: JOB_ID });
    expect(result.current.error).toBe('Processing failed');
  });

  it('ignores messages for a different job id', () => {
    const { result } = renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    openWs();

    sendMessage({ type: 'job:progress', jobId: 'other-job', progress: 99, status: 'active' });
    expect(result.current.progress).toBe(0);
  });

  it('sets an error state on websocket connection error', () => {
    const { result } = renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    act(() => {
      latestWs!.onerror?.(new Event('error'));
    });
    expect(result.current.error).toBe(
      'WebSocket connection error. Progress updates may be delayed.'
    );
  });

  it('does not open a socket when jobId is null', () => {
    const before = wsCallCount;
    renderHook(() => useJobWebSocket(null, INITIAL));
    expect(wsCallCount).toBe(before);
  });

  it('does not open a socket when there is no access token', () => {
    useAuthStore.getState().clearAuth();
    const before = wsCallCount;
    renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    expect(wsCallCount).toBe(before);
  });

  it('does not open a new socket when the job is already in a terminal state', () => {
    const before = wsCallCount;
    renderHook(() => useJobWebSocket(JOB_ID, { progress: 100, status: 'completed' as const }));
    expect(wsCallCount).toBe(before);
  });

  it('closes the socket on unmount', () => {
    const { unmount } = renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    openWs();
    unmount();
    expect(latestWs!.close).toHaveBeenCalled();
  });

  it('ignores malformed JSON messages without throwing', () => {
    const { result } = renderHook(() => useJobWebSocket(JOB_ID, INITIAL));
    openWs();

    act(() => {
      latestWs!.onmessage?.(new MessageEvent('message', { data: '{not valid json' }));
    });

    // State should be unchanged.
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });
});
