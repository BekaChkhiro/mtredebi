import { createServer } from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { config } from './config/index.js';
import { setupSocket } from './socket/index.js';

const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocket(io);

// Start server
httpServer.listen(config.port, () => {
  console.log(`
  🚀 MTREDEBI API Server
  ──────────────────────
  Environment: ${config.nodeEnv}
  Port: ${config.port}
  Health: http://localhost:${config.port}/health
  API: http://localhost:${config.port}/api/v1
  `);
});

export { io };
