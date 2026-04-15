import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  truncateText,
} from '../../src/utils/formatters';

describe('formatCurrency', () => {
  it('formats a number as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('returns $0.00 for null', () => {
    expect(formatCurrency(null)).toBe('$0.00');
  });

  it('returns $0.00 for undefined', () => {
    expect(formatCurrency(undefined)).toBe('$0.00');
  });

  it('formats small amounts', () => {
    expect(formatCurrency(0.99)).toBe('$0.99');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-01-15T00:00:00Z');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });
});

describe('formatDateTime', () => {
  it('formats a date with time', () => {
    const result = formatDateTime('2024-06-01T12:30:00Z');
    expect(result).toMatch(/2024/);
  });

  it('returns empty string for null', () => {
    expect(formatDateTime(null)).toBe('');
  });
});

describe('truncateText', () => {
  it('returns text as-is when shorter than limit', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates text and adds ellipsis', () => {
    const result = truncateText('Hello World', 5);
    expect(result).toBe('Hello...');
  });

  it('returns empty string for null/undefined', () => {
    expect(truncateText(null)).toBe('');
    expect(truncateText(undefined)).toBe('');
  });

  it('uses default length of 50', () => {
    const text = 'A'.repeat(60);
    const result = truncateText(text);
    expect(result.length).toBe(53); // 50 + '...'
  });
});
