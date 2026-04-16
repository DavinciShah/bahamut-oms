'use strict';

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const notificationService = require('../services/notificationService');

let _io = null;

function setupSocket(server) {
  _io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // JWT authentication middleware
  _io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      socket.userId = String(decoded.id || decoded.userId || decoded.sub);
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  notificationService.setIO(_io);

  _io.on('connection', (socket) => {
    const userId = socket.userId;
    // Automatically put the user in their personal room
    socket.join(`user:${userId}`);

    socket.on('join-room', (room) => {
      socket.join(room);
      socket.emit('joined-room', { room });
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
      socket.emit('left-room', { room });
    });

    socket.on('mark-notification-read', async ({ notificationId }) => {
      try {
        await notificationService.markRead(notificationId, userId);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      // cleanup handled automatically by socket.io
    });
  });

  return _io;
}

function emitToUser(userId, event, data) {
  if (!_io) {
    console.warn('[socketHandler] Socket.io not initialized');
    return;
  }
  _io.to(`user:${userId}`).emit(event, data);
}

function getIO() {
  return _io;
}

module.exports = { setupSocket, emitToUser, getIO };
