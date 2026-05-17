import { io } from 'socket.io-client';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const normalizeSocketUrlForHttps = (url) => {
  if (!url) return url;

  try {
    const parsedUrl = new URL(url);
    const isLocalhost = LOCAL_HOSTS.has(parsedUrl.hostname);

    if (window.location.protocol === 'https:' && !isLocalhost) {
      if (parsedUrl.protocol === 'http:') {
        parsedUrl.protocol = 'https:';
        return parsedUrl.toString();
      }

      if (parsedUrl.protocol === 'ws:') {
        parsedUrl.protocol = 'wss:';
        return parsedUrl.toString();
      }
    }
  } catch {
    return url;
  }

  return url;
};

let socket = null;
const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL;
const socketUrl = normalizeSocketUrlForHttps(configuredSocketUrl || window.location.origin);
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
