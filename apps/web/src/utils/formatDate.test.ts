import { describe, expect, it } from 'vitest';

import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats a date string into a human-readable string', () => {
    // Use a fixed date to avoid locale-dependent day-of-week surprises.
    const result = formatDate('2024-06-15T00:00:00.000Z');
    // The exact format depends on the runtime locale, but it must contain the year and month.
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/Jun/i);
    expect(result).toMatch(/15/);
  });

  it('accepts a Date object', () => {
    const result = formatDate(new Date('2023-01-01T00:00:00.000Z'));
    expect(result).toMatch(/2023/);
  });

  it('returns a non-empty string for any valid date', () => {
    expect(formatDate('2000-12-31')).toBeTruthy();
  });
});
