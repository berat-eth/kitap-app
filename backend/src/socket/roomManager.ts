import { v4 as uuidv4 } from 'uuid';
import {
  VoiceRoom,
  VoiceRoomPublic,
  RoomParticipant,
  CreateRoomDTO,
} from '../types';
import { logger } from '../utils';

const MAX_ROOMS = 100;
const EMPTY_ROOM_TIMEOUT_MS = 5 * 60 * 1000; // 5 dakika
const MIN_MAX_PARTICIPANTS = 2;
const MAX_MAX_PARTICIPANTS = 50;
const MAX_TOPIC_LENGTH = 100;

class RoomManager {
  private rooms: Map<string, VoiceRoom> = new Map();
  private deviceToRoom: Map<string, string> = new Map();
  private cleanupIntervals: Map<string, NodeJS.Timeout> = new Map();

  createRoom(
    hostDeviceId: string,
    hostDeviceName: string,
    hostSocketId: string,
    data: CreateRoomDTO
  ): VoiceRoom | null {
    if (this.rooms.size >= MAX_ROOMS) {
      logger.warn('Maximum room limit reached');
      return null;
    }

    const existingRoomId = this.deviceToRoom.get(hostDeviceId);
    if (existingRoomId) {
      this.leaveRoom(hostDeviceId);
    }

    const roomId = uuidv4();
    const hostParticipant: RoomParticipant = {
      deviceId: hostDeviceId,
      deviceName: hostDeviceName,
      isMuted: false,
      joinedAt: new Date(),
      socketId: hostSocketId,
    };

    const maxParticipants = Math.min(
      MAX_MAX_PARTICIPANTS,
      Math.max(MIN_MAX_PARTICIPANTS, typeof data.maxParticipants === 'number' && Number.isFinite(data.maxParticipants) ? data.maxParticipants : 10)
    );
    const topic =
      data.topic !== undefined && data.topic !== null && typeof data.topic === 'string'
        ? data.topic.trim().slice(0, MAX_TOPIC_LENGTH) || undefined
        : undefined;

    const room: VoiceRoom = {
      id: roomId,
      name: data.name,
      topic,
      hostDeviceId,
      participants: new Map([[hostDeviceId, hostParticipant]]),
      maxParticipants,
      createdAt: new Date(),
      isLive: true,
    };

    this.rooms.set(roomId, room);
    this.deviceToRoom.set(hostDeviceId, roomId);

    logger.info(`Room created: ${roomId} by device ${hostDeviceId}`);
    return room;
  }

  joinRoom(
    roomId: string,
    deviceId: string,
    deviceName: string,
    socketId: string
  ): { room: VoiceRoom; participant: RoomParticipant } | null {
    const trimmedRoomId = typeof roomId === 'string' ? roomId.trim() : '';
    if (!trimmedRoomId) {
      logger.warn('joinRoom: geçersiz roomId');
      return null;
    }
    const room = this.rooms.get(trimmedRoomId);
    if (!room) {
      logger.warn(`Room not found: ${trimmedRoomId}`);
      return null;
    }

    if (room.participants.size >= room.maxParticipants) {
      logger.warn(`Room ${trimmedRoomId} is full`);
      return null;
    }

    const existingRoomId = this.deviceToRoom.get(deviceId);
    if (existingRoomId && existingRoomId !== trimmedRoomId) {
      this.leaveRoom(deviceId);
    }

    if (room.participants.has(deviceId)) {
      const existingParticipant = room.participants.get(deviceId)!;
      existingParticipant.socketId = socketId;
      return { room, participant: existingParticipant };
    }

    const participant: RoomParticipant = {
      deviceId,
      deviceName,
      isMuted: false,
      joinedAt: new Date(),
      socketId,
    };

    room.participants.set(deviceId, participant);
    this.deviceToRoom.set(deviceId, trimmedRoomId);

    this.cancelCleanup(trimmedRoomId);

    logger.info(`Device ${deviceId} joined room ${trimmedRoomId}`);
    return { room, participant };
  }

  leaveRoom(deviceId: string): { roomId: string; room: VoiceRoom | null } | null {
    const roomId = this.deviceToRoom.get(deviceId);
    if (!roomId) {
      return null;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      this.deviceToRoom.delete(deviceId);
      return null;
    }

    room.participants.delete(deviceId);
    this.deviceToRoom.delete(deviceId);

    logger.info(`Device ${deviceId} left room ${roomId}`);

    if (room.participants.size === 0) {
      this.scheduleCleanup(roomId);
      room.isLive = false;
    } else if (room.hostDeviceId === deviceId) {
      const newHost = room.participants.keys().next().value;
      if (newHost) {
        room.hostDeviceId = newHost;
        logger.info(`New host for room ${roomId}: ${newHost}`);
      }
    }

    return { roomId, room };
  }

  setMuted(deviceId: string, isMuted: boolean): { roomId: string; success: boolean } | null {
    const roomId = this.deviceToRoom.get(deviceId);
    if (!roomId) {
      return null;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const participant = room.participants.get(deviceId);
    if (!participant) {
      return null;
    }

    participant.isMuted = isMuted;
    return { roomId, success: true };
  }

  getRoom(roomId: string): VoiceRoom | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByDeviceId(deviceId: string): VoiceRoom | undefined {
    const roomId = this.deviceToRoom.get(deviceId);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  getParticipantSocketId(roomId: string, deviceId: string): string | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    return room.participants.get(deviceId)?.socketId;
  }

  getAllRooms(): VoiceRoomPublic[] {
    const publicRooms: VoiceRoomPublic[] = [];

    this.rooms.forEach((room) => {
      publicRooms.push(this.toPublicRoom(room));
    });

    return publicRooms.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  getActiveRooms(): VoiceRoomPublic[] {
    return this.getAllRooms().filter((room) => room.isLive);
  }

  toPublicRoom(room: VoiceRoom): VoiceRoomPublic {
    const participants: Array<Omit<RoomParticipant, 'socketId'>> = [];
    room.participants.forEach((p) => {
      participants.push({
        deviceId: p.deviceId,
        deviceName: p.deviceName,
        isMuted: p.isMuted,
        joinedAt: p.joinedAt,
      });
    });

    return {
      id: room.id,
      name: room.name,
      topic: room.topic,
      hostDeviceId: room.hostDeviceId,
      participantCount: room.participants.size,
      maxParticipants: room.maxParticipants,
      createdAt: room.createdAt,
      isLive: room.isLive,
      participants,
    };
  }

  closeRoom(roomId: string, requestingDeviceId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    if (room.hostDeviceId !== requestingDeviceId) {
      logger.warn(
        `Device ${requestingDeviceId} attempted to close room ${roomId} but is not the host`
      );
      return false;
    }

    room.participants.forEach((_, deviceId) => {
      this.deviceToRoom.delete(deviceId);
    });

    this.rooms.delete(roomId);
    this.cancelCleanup(roomId);

    logger.info(`Room ${roomId} closed by host ${requestingDeviceId}`);
    return true;
  }

  private scheduleCleanup(roomId: string): void {
    if (this.cleanupIntervals.has(roomId)) {
      return;
    }

    const timeout = setTimeout(() => {
      const room = this.rooms.get(roomId);
      if (room && room.participants.size === 0) {
        this.rooms.delete(roomId);
        logger.info(`Empty room ${roomId} cleaned up`);
      }
      this.cleanupIntervals.delete(roomId);
    }, EMPTY_ROOM_TIMEOUT_MS);

    this.cleanupIntervals.set(roomId, timeout);
  }

  private cancelCleanup(roomId: string): void {
    const timeout = this.cleanupIntervals.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      this.cleanupIntervals.delete(roomId);
    }
  }

  getStats(): { totalRooms: number; activeRooms: number; totalParticipants: number } {
    let totalParticipants = 0;
    let activeRooms = 0;

    this.rooms.forEach((room) => {
      totalParticipants += room.participants.size;
      if (room.isLive) activeRooms++;
    });

    return {
      totalRooms: this.rooms.size,
      activeRooms,
      totalParticipants,
    };
  }
}

export const roomManager = new RoomManager();
