const activeSessions = new Map();

const chatService = {
  startChat(userId, agentId) {
    const roomId = `chat_${userId}_${agentId}_${Date.now()}`;
    activeSessions.set(roomId, {
      roomId,
      userId,
      agentId,
      messages: [],
      startedAt: new Date(),
      active: true
    });
    return { roomId, userId, agentId, startedAt: activeSessions.get(roomId).startedAt };
  },

  sendMessage(roomId, senderId, message) {
    const session = activeSessions.get(roomId);
    if (!session) throw new Error('Chat session not found');
    if (!session.active) throw new Error('Chat session is closed');

    const msg = {
      id: `msg_${Date.now()}`,
      roomId,
      senderId,
      message,
      timestamp: new Date()
    };
    session.messages.push(msg);
    return msg;
  },

  endChat(roomId) {
    const session = activeSessions.get(roomId);
    if (!session) throw new Error('Chat session not found');
    session.active = false;
    session.endedAt = new Date();
    return session;
  },

  getActiveSessions() {
    const sessions = [];
    activeSessions.forEach(session => {
      if (session.active) sessions.push(session);
    });
    return sessions;
  },

  getSession(roomId) {
    return activeSessions.get(roomId);
  },

  attachSocketHandlers(io) {
    io.of('/support').on('connection', socket => {
      const { userId, agentId, roomId } = socket.handshake.query;

      if (roomId) {
        socket.join(roomId);
      }

      socket.on('join_room', ({ roomId: rid }) => {
        socket.join(rid);
        socket.to(rid).emit('user_joined', { userId, timestamp: new Date() });
      });

      socket.on('send_message', ({ roomId: rid, message }) => {
        const msg = chatService.sendMessage(rid, userId, message);
        io.of('/support').to(rid).emit('new_message', msg);
      });

      socket.on('end_chat', ({ roomId: rid }) => {
        chatService.endChat(rid);
        io.of('/support').to(rid).emit('chat_ended', { roomId: rid, timestamp: new Date() });
      });

      socket.on('disconnect', () => {
        // Clean up if needed
      });
    });
  }
};

module.exports = chatService;
