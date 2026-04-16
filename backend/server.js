require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const socketHandler = require('./src/websocket/socketHandler');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const { setupSocket, getIO } = socketHandler;
const io = setupSocket(server);
if (io) app.set('io', io);

server.listen(PORT, () => console.log(`Server on port ${PORT}`));