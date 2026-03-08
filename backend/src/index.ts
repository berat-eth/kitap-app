import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { testConnection } from './config/database';
import { registerVoiceChatHandlers } from './socket/voiceChat';
import { logger, LOG_CONTEXT } from './utils/logger';

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
    logger.info(LOG_CONTEXT.SERVER, 'Server started', {
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
      logLevel: env.LOG_LEVEL,
    });
    logger.info(LOG_CONTEXT.SERVER, 'Endpoints', {
      api: `http://localhost:${env.PORT}/api`,
      health: `http://localhost:${env.PORT}/api/health`,
    });
  });
}

bootstrap().catch((err) => {
  logger.errorEx(LOG_CONTEXT.SERVER, 'Failed to start', err);
  process.exit(1);
});
