require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const socketHandler = require('./src/websocket/socketHandler');
const { validateEnv } = require('./src/config/validateEnv');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const startupWarnings = validateEnv();
startupWarnings.forEach((warning) => console.warn(`[startup warning] ${warning}`));

const { setupSocket, getIO } = socketHandler;
const io = setupSocket(server);
if (io) app.set('io', io);

server.listen(PORT, () => console.log(`Server on port ${PORT}`));

function shutdown(signal) {
	console.log(`Received ${signal}. Shutting down gracefully...`);
	server.close(() => {
		console.log('HTTP server closed.');
		process.exit(0);
	});

	setTimeout(() => {
		console.error('Forced shutdown after timeout.');
		process.exit(1);
	}, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));