export const queryKeys = {
  files: {
    all: ['files'] as const,
    list: (filters?: Record<string, unknown>) => ['files', 'list', filters] as const,
    detail: (id: string) => ['files', id] as const,
  },
};
