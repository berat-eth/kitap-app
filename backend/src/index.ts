import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { testConnection } from './config/database';
import { registerVoiceChatHandlers } from './socket/voiceChat';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: env.ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

registerVoiceChatHandlers(io);

async function bootstrap(): Promise<void> {
  await testConnection();

  server.listen(env.PORT, () => {
    console.log(`[Server] Running on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`[Server] REST API: http://localhost:${env.PORT}/api`);
    console.log(`[Server] Health:   http://localhost:${env.PORT}/api/health`);
  });
}

bootstrap().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
