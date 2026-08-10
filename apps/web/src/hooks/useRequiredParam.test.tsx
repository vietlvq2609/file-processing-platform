import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { useRequiredParam } from './useRequiredParam.js';

describe('useRequiredParam', () => {
  it('returns the param value when it exists in the URL', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={['/items/abc123']}>
        <Routes>
          <Route path="/items/:id" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useRequiredParam('id'), { wrapper });

    expect(result.current).toBe('abc123');
  });

  it('throws when the param is missing from the route', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={['/items']}>
        <Routes>
          <Route path="/items" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    );

    expect(() => renderHook(() => useRequiredParam('id'), { wrapper })).toThrow(
      'Route param ":id" is missing'
    );

    consoleSpy.mockRestore();
  });
});
