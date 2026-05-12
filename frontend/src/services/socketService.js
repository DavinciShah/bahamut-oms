import { io } from 'socket.io-client';

let socket = null;
const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL;
const socketUrl = configuredSocketUrl || window.location.origin;
let missingSocketUrlWarningShown = false;

const socketService = {
  connect(token) {
    if (socket?.connected) return socket;
    if (!configuredSocketUrl && !missingSocketUrlWarningShown) {
      console.warn('[Socket] VITE_SOCKET_URL is not set; using current origin fallback.');
      missingSocketUrlWarningShown = true;
    }
    socket = io(socketUrl, {
      auth: { token },
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
