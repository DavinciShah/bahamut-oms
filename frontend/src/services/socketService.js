import { io } from 'socket.io-client';

let socket = null;
const API_URL = import.meta.env.VITE_API_URL || '';

function resolveSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (!API_URL) return window.location.origin;
  try {
    return new URL(API_URL, window.location.origin).origin;
  } catch (error) {
    console.warn('[Socket] Invalid VITE_API_URL; falling back to current origin.', error);
    return window.location.origin;
  }
}

const SOCKET_URL = resolveSocketUrl();

const socketService = {
  connect(token) {
    if (socket?.connected) return socket;
    socket = io(SOCKET_URL, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
    socket.on('disconnect', reason => console.log('[Socket] Disconnected:', reason));
    socket.on('connect_error', err => console.error('[Socket] Error:', err.message));
    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  on(event, callback) {
    if (!socket) return;
    socket.on(event, callback);
  },

  off(event, callback) {
    if (!socket) return;
    socket.off(event, callback);
  },

  emit(event, data) {
    if (!socket?.connected) return;
    socket.emit(event, data);
  },

  getSocket() {
    return socket;
  },

  isConnected() {
    return socket?.connected || false;
  }
};

export default socketService;
