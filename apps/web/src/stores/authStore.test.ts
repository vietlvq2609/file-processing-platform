import { afterEach, describe, expect, it } from 'vitest';

import { useAuthStore } from './authStore';

/** Reset Zustand store state between tests. */
afterEach(() => {
  useAuthStore.getState().clearAuth();
});

describe('authStore', () => {
  it('initialises with null token and user', () => {
    const { accessToken, user } = useAuthStore.getState();
    expect(accessToken).toBeNull();
    expect(user).toBeNull();
  });

  it('setAuth stores token and user', () => {
    const mockUser = { id: 'u1', email: 'a@b.com', createdAt: '', updatedAt: '' };
    useAuthStore.getState().setAuth('tok123', mockUser);

    const { accessToken, user } = useAuthStore.getState();
    expect(accessToken).toBe('tok123');
    expect(user).toEqual(mockUser);
  });

  it('setAccessToken updates only the token', () => {
    const mockUser = { id: 'u1', email: 'a@b.com', createdAt: '', updatedAt: '' };
    useAuthStore.getState().setAuth('old', mockUser);
    useAuthStore.getState().setAccessToken('new');

    const { accessToken, user } = useAuthStore.getState();
    expect(accessToken).toBe('new');
    expect(user).toEqual(mockUser);
  });

  it('setAccessToken accepts null to clear the token', () => {
    useAuthStore.getState().setAccessToken(null);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('clearAuth resets both token and user to null', () => {
    const mockUser = { id: 'u1', email: 'a@b.com', createdAt: '', updatedAt: '' };
    useAuthStore.getState().setAuth('tok', mockUser);
    useAuthStore.getState().clearAuth();

    const { accessToken, user } = useAuthStore.getState();
    expect(accessToken).toBeNull();
    expect(user).toBeNull();
  });
});
