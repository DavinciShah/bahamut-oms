import { ORDER_STATUSES } from './constants';

export function getStatusColor(status) {
  const map = {
    [ORDER_STATUSES.PENDING]: 'status-pending',
    [ORDER_STATUSES.PROCESSING]: 'status-processing',
    [ORDER_STATUSES.SHIPPED]: 'status-shipped',
    [ORDER_STATUSES.DELIVERED]: 'status-delivered',
    [ORDER_STATUSES.CANCELLED]: 'status-cancelled',
  };
  return map[status] || 'status-default';
}

export function buildQueryString(params) {
  if (!params) return '';
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!filtered.length) return '';
  return '?' + new URLSearchParams(filtered).toString();
}

export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
