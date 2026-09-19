import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { db } from './database.js';
import { pubsub } from './pubsub.js';
import { WebSocketManager } from './wsHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

app.use(cors({
  origin: FRONTEND_URL === '*' ? '*' : [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Health & Monitoring endpoints
app.get('/healthz', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/stats', (_req, res) => {
  const wsStats = wsManager ? wsManager.getStats() : { connectedClients: 0, activeRooms: 0 };
  res.status(200).json({
    ...wsStats,
    platform: 'PulseChat Real-Time Cluster',
    version: '2026.1',
    memoryUsage: process.memoryUsage()
  });
});

// REST API for rooms
app.get('/api/rooms', async (_req, res) => {
  try {
    const rooms = await db.getRooms();
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// REST API for room messages history
app.get('/api/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const messages = await db.getRoomMessages(roomId, limit);
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Create HTTP and WebSocket servers
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const wsManager = new WebSocketManager(wss);

wss.on('connection', (ws) => {
  wsManager.handleConnection(ws);
});

async function bootstrap() {
  await db.initialize();
  await pubsub.initialize();

  server.listen(PORT, () => {
    console.log(`🚀 PulseChat Server running on http://localhost:${PORT}`);
    console.log(`⚡ WebSocket gateway listening at ws://localhost:${PORT}/ws`);
  });
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing WebSocket server and HTTP listeners...');
  server.close(() => {
    console.log('PulseChat Server safely terminated.');
    process.exit(0);
  });
});

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});

export { app, server };
