import { describe, expect, it } from 'vitest';

import { formatBytes } from './formatBytes';

describe('formatBytes', () => {
  it('returns "0 Bytes" for 0', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('formats bytes under 1 KB', () => {
    expect(formatBytes(512)).toBe('512 Bytes');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('rounds to 2 decimal places by default', () => {
    expect(formatBytes(1500)).toBe('1.46 KB');
  });

  it('respects a custom decimals argument', () => {
    expect(formatBytes(1500, 0)).toBe('1 KB');
    expect(formatBytes(1500, 3)).toBe('1.465 KB');
  });

  it('clamps negative decimals to 0', () => {
    expect(formatBytes(1024, -1)).toBe('1 KB');
  });
});
