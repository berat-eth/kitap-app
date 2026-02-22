import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { roomManager } from './roomManager';
import { setupSignalingHandlers } from './signalingHandler';
import { AppDataSource } from '../config/database';
import { Device } from '../entities/Device';
import { config } from '../config';
import { logger } from '../utils';
import {
  CreateRoomDTO,
  JoinRoomDTO,
  LeaveRoomDTO,
  MuteDTO,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  ParticipantMutedPayload,
  RoomParticipant,
} from '../types';

let io: Server | null = null;

const EVENT_RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 1000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(socketId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(socketId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(socketId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= EVENT_RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

const RATE_LIMIT_CLEANUP_INTERVAL_MS = 2 * 60 * 1000; // 2 dakika

function startRateLimitCleanup(): void {
  setInterval(() => {
    const now = Date.now();
    for (const [socketId, entry] of rateLimitMap.entries()) {
      if (entry.resetAt < now - RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(socketId);
      }
    }
  }, RATE_LIMIT_CLEANUP_INTERVAL_MS);
}

export function initializeSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const rawAuth = socket.handshake.auth?.deviceId;
      const rawHeader = socket.handshake.headers['x-device-id'];
      const raw = rawAuth ?? rawHeader;
      const deviceId =
        typeof raw === 'string'
          ? raw.trim()
          : Array.isArray(raw)
            ? (raw[0] && String(raw[0]).trim()) || ''
            : '';

      if (!deviceId) {
        return next(new Error('Device ID gerekli'));
      }

      const deviceRepository = AppDataSource.getRepository(Device);
      const device = await deviceRepository.findOne({ where: { deviceId } });

      if (!device) {
        return next(new Error('Geçersiz Device ID'));
      }

      device.lastSeen = new Date();
      await deviceRepository.save(device);

      socket.data.deviceId = deviceId;
      socket.data.deviceName = device.deviceName || 'Anonim';
      socket.data.device = device;

      next();
    } catch (error) {
      logger.error('Socket auth error:', error);
      next(new Error('Kimlik doğrulama hatası'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const deviceId = socket.data.deviceId as string;
    const deviceName = socket.data.deviceName as string;

    logger.info(`Socket connected: ${socket.id} (device: ${deviceId})`);

    socket.use((event, next) => {
      if (!checkRateLimit(socket.id)) {
        socket.emit('error', {
          message: 'Çok fazla istek gönderiyorsunuz',
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return next(new Error('RATE_LIMIT_EXCEEDED'));
      }
      next();
    });

    socket.on('room:create', (data: CreateRoomDTO) => {
      if (!data || typeof data !== 'object') {
        socket.emit('error', { message: 'Geçersiz istek', code: 'INVALID_PAYLOAD' });
        return;
      }
      handleCreateRoom(socket, deviceId, deviceName, data);
    });

    socket.on('room:join', (data: JoinRoomDTO) => {
      if (!data || typeof data.roomId !== 'string' || !data.roomId.trim()) {
        socket.emit('error', { message: 'Geçersiz oda bilgisi', code: 'INVALID_PAYLOAD' });
        return;
      }
      handleJoinRoom(socket, deviceId, deviceName, data);
    });

    socket.on('room:leave', (data: LeaveRoomDTO) => {
      handleLeaveRoom(socket, deviceId, data);
    });

    socket.on('room:list', () => {
      handleListRooms(socket);
    });

    socket.on('room:close', (data: { roomId: string }) => {
      if (!data || typeof data.roomId !== 'string' || !data.roomId.trim()) {
        socket.emit('error', { message: 'Geçersiz oda bilgisi', code: 'INVALID_PAYLOAD' });
        return;
      }
      handleCloseRoom(socket, deviceId, data.roomId);
    });

    socket.on('participant:mute', (data: MuteDTO) => {
      if (!data || typeof data.isMuted !== 'boolean') {
        socket.emit('error', { message: 'Geçersiz istek', code: 'INVALID_PAYLOAD' });
        return;
      }
      handleMute(socket, deviceId, data);
    });

    const ioRef = getIO();
    if (ioRef) setupSignalingHandlers(socket, ioRef);

    socket.on('disconnect', (reason) => {
      handleDisconnect(socket, deviceId, reason);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for ${deviceId}:`, error);
    });
  });

  startRateLimitCleanup();
  logger.info('Socket.io initialized');
  return io;
}

function handleCreateRoom(
  socket: Socket,
  deviceId: string,
  deviceName: string,
  data: CreateRoomDTO
): void {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) {
    socket.emit('error', { message: 'Oda adı gerekli', code: 'INVALID_NAME' });
    return;
  }

  if (name.length > 50) {
    socket.emit('error', { message: 'Oda adı çok uzun', code: 'NAME_TOO_LONG' });
    return;
  }

  const topic =
    data.topic !== undefined && data.topic !== null && typeof data.topic === 'string'
      ? data.topic.trim().slice(0, 100)
      : undefined;

  const room = roomManager.createRoom(deviceId, deviceName, socket.id, {
    name,
    topic: topic || undefined,
    maxParticipants: data.maxParticipants,
  });

  if (!room) {
    socket.emit('error', {
      message: 'Oda oluşturulamadı. Maksimum oda sayısına ulaşıldı.',
      code: 'MAX_ROOMS_REACHED',
    });
    return;
  }

  socket.join(room.id);

  socket.emit('room:created', { room: roomManager.toPublicRoom(room) });

  io?.emit('room:list', { rooms: roomManager.getActiveRooms() });

  logger.info(`Room created: ${room.id} (${room.name}) by ${deviceId}`);
}

function handleJoinRoom(
  socket: Socket,
  deviceId: string,
  deviceName: string,
  data: JoinRoomDTO
): void {
  const roomId = data.roomId.trim();
  const result = roomManager.joinRoom(roomId, deviceId, deviceName, socket.id);

  if (!result) {
    socket.emit('error', {
      message: 'Odaya katılınamadı. Oda bulunamadı veya dolu.',
      code: 'JOIN_FAILED',
    });
    return;
  }

  const { room, participant } = result;

  socket.join(room.id);

  const publicRoom = roomManager.toPublicRoom(room);
  socket.emit('room:joined', {
    room: publicRoom,
    participants: publicRoom.participants,
  });

  const joinPayload: ParticipantJoinedPayload = {
    roomId: room.id,
    participant: {
      deviceId: participant.deviceId,
      deviceName: participant.deviceName,
      isMuted: participant.isMuted,
      joinedAt: participant.joinedAt,
    },
  };
  socket.to(room.id).emit('participant:joined', joinPayload);

  io?.emit('room:list', { rooms: roomManager.getActiveRooms() });

  logger.info(`Device ${deviceId} joined room ${room.id}`);
}

function handleLeaveRoom(socket: Socket, deviceId: string, data: LeaveRoomDTO): void {
  const result = roomManager.leaveRoom(deviceId);

  if (!result) {
    socket.emit('error', { message: 'Odadan ayrılınamadı', code: 'LEAVE_FAILED' });
    return;
  }

  const { roomId, room } = result;

  socket.leave(roomId);
  socket.emit('room:left', { roomId });

  const leftPayload: ParticipantLeftPayload = { roomId, deviceId };
  socket.to(roomId).emit('participant:left', leftPayload);

  if (room) {
    socket.to(roomId).emit('room:updated', { room: roomManager.toPublicRoom(room) });
  }

  io?.emit('room:list', { rooms: roomManager.getActiveRooms() });

  logger.info(`Device ${deviceId} left room ${roomId}`);
}

function handleListRooms(socket: Socket): void {
  const rooms = roomManager.getActiveRooms();
  socket.emit('room:list', { rooms });
}

function handleCloseRoom(socket: Socket, deviceId: string, roomId: string): void {
  const trimmedRoomId = roomId.trim();
  if (!trimmedRoomId) {
    socket.emit('error', { message: 'Geçersiz oda bilgisi', code: 'INVALID_PAYLOAD' });
    return;
  }
  const room = roomManager.getRoom(trimmedRoomId);
  if (!room) {
    socket.emit('error', { message: 'Oda bulunamadı', code: 'ROOM_NOT_FOUND' });
    return;
  }

  const closed = roomManager.closeRoom(trimmedRoomId, deviceId);

  if (!closed) {
    socket.emit('error', {
      message: 'Odayı kapatma yetkiniz yok',
      code: 'NOT_AUTHORIZED',
    });
    return;
  }

  io?.to(trimmedRoomId).emit('room:closed', { roomId: trimmedRoomId });
  io?.in(trimmedRoomId).socketsLeave(trimmedRoomId);
  io?.emit('room:list', { rooms: roomManager.getActiveRooms() });

  logger.info(`Room ${trimmedRoomId} closed by host ${deviceId}`);
}

function handleMute(socket: Socket, deviceId: string, data: MuteDTO): void {
  const result = roomManager.setMuted(deviceId, data.isMuted);

  if (!result) {
    socket.emit('error', { message: 'İşlem başarısız', code: 'MUTE_FAILED' });
    return;
  }

  const payload: ParticipantMutedPayload = {
    roomId: result.roomId,
    deviceId,
    isMuted: data.isMuted,
  };

  io?.to(result.roomId).emit('participant:muted', payload);
}

function handleDisconnect(socket: Socket, deviceId: string, reason: string): void {
  logger.info(`Socket disconnected: ${socket.id} (device: ${deviceId}, reason: ${reason})`);

  const result = roomManager.leaveRoom(deviceId);

  if (result) {
    const { roomId, room } = result;
    const leftPayload: ParticipantLeftPayload = { roomId, deviceId };
    socket.to(roomId).emit('participant:left', leftPayload);

    if (room) {
      socket.to(roomId).emit('room:updated', { room: roomManager.toPublicRoom(room) });
    }

    io?.emit('room:list', { rooms: roomManager.getActiveRooms() });
  }

  rateLimitMap.delete(socket.id);
}

export function getIO(): Server | null {
  return io;
}

export function closeSocket(): Promise<void> {
  return new Promise((resolve) => {
    if (io) {
      io.close(() => {
        rateLimitMap.clear();
        logger.info('Socket.io closed');
        io = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

export { roomManager };
