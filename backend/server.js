require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const socketHandler = require('./src/websocket/socketHandler');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

socketHandler(io);
app.set('io', io);

server.listen(PORT, () => console.log(`Server on port ${PORT}`));