import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ORDER_STATUSES } from '../../src/utils/constants';
import { getStatusColor, buildQueryString, debounce, classNames } from '../../src/utils/helpers';

describe('helpers.getStatusColor', () => {
  it('maps known statuses to their css class', () => {
    expect(getStatusColor(ORDER_STATUSES.PENDING)).toBe('status-pending');
    expect(getStatusColor(ORDER_STATUSES.PROCESSING)).toBe('status-processing');
    expect(getStatusColor(ORDER_STATUSES.SHIPPED)).toBe('status-shipped');
    expect(getStatusColor(ORDER_STATUSES.DELIVERED)).toBe('status-delivered');
    expect(getStatusColor(ORDER_STATUSES.CANCELLED)).toBe('status-cancelled');
  });

  it('returns default class for unknown status', () => {
    expect(getStatusColor('unknown')).toBe('status-default');
  });
});

describe('helpers.buildQueryString', () => {
  it('returns empty string when params are missing', () => {
    expect(buildQueryString()).toBe('');
    expect(buildQueryString(null)).toBe('');
  });

  it('omits undefined, null and empty string values', () => {
    const query = buildQueryString({
      search: 'widget',
      status: '',
      page: 2,
      active: false,
      category: undefined,
      owner: null
    });

    expect(query).toBe('?search=widget&page=2&active=false');
  });

  it('returns empty string when every value is filtered out', () => {
    expect(buildQueryString({ a: '', b: undefined, c: null })).toBe('');
  });
});

describe('helpers.debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls function once with latest arguments after delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('first');
    debounced('second');
    vi.advanceTimersByTime(199);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
  });

  it('preserves this context for the wrapped function', () => {
    const obj = {
      value: 123,
      fn: vi.fn(function () {
        return this.value;
      })
    };

    const debounced = debounce(obj.fn, 100);
    debounced.call(obj);
    vi.advanceTimersByTime(100);

    expect(obj.fn).toHaveBeenCalledTimes(1);
    expect(obj.fn.mock.instances[0]).toBe(obj);
  });
});

describe('helpers.classNames', () => {
  it('joins only truthy classes', () => {
    expect(classNames('btn', '', false, 'primary', null, undefined, 'active')).toBe(
      'btn primary active'
    );
  });

  it('returns empty string when all classes are falsy', () => {
    expect(classNames('', null, undefined, false)).toBe('');
  });
});
