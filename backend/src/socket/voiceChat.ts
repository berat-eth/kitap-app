import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface RoomParticipant {
  deviceId: string;
  deviceName: string;
  socketId: string;
  isMuted: boolean;
  joinedAt: Date;
}

interface VoiceRoom {
  id: string;
  name: string;
  topic?: string;
  hostDeviceId: string;
  maxParticipants: number;
  participants: Map<string, RoomParticipant>;
  createdAt: Date;
  isLive: boolean;
}

const rooms = new Map<string, VoiceRoom>();

function serializeRoom(room: VoiceRoom) {
  return {
    id: room.id,
    name: room.name,
    topic: room.topic,
    hostDeviceId: room.hostDeviceId,
    maxParticipants: room.maxParticipants,
    participantCount: room.participants.size,
    participants: Array.from(room.participants.values()).map((p) => ({
      deviceId: p.deviceId,
      deviceName: p.deviceName,
      isMuted: p.isMuted,
      joinedAt: p.joinedAt,
    })),
    createdAt: room.createdAt,
    isLive: room.isLive,
  };
}

export function registerVoiceChatHandlers(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    let currentRoomId: string | null = null;
    let currentDeviceId: string | null = null;

    socket.on(
      'room:create',
      (data: { name: string; topic?: string; deviceId: string; deviceName?: string; maxParticipants?: number }) => {
        const room: VoiceRoom = {
          id: uuidv4(),
          name: data.name,
          topic: data.topic,
          hostDeviceId: data.deviceId,
          maxParticipants: data.maxParticipants ?? 10,
          participants: new Map(),
          createdAt: new Date(),
          isLive: true,
        };

        const host: RoomParticipant = {
          deviceId: data.deviceId,
          deviceName: data.deviceName ?? 'Unknown',
          socketId: socket.id,
          isMuted: false,
          joinedAt: new Date(),
        };

        room.participants.set(data.deviceId, host);
        rooms.set(room.id, room);

        currentRoomId = room.id;
        currentDeviceId = data.deviceId;

        socket.join(room.id);
        socket.emit('room:created', serializeRoom(room));
        io.emit('room:list', getRoomList());
      },
    );

    socket.on(
      'room:join',
      (data: { roomId: string; deviceId: string; deviceName?: string }) => {
        const room = rooms.get(data.roomId);
        if (!room || !room.isLive) {
          socket.emit('error', { message: 'Room not found or no longer active' });
          return;
        }
        if (room.participants.size >= room.maxParticipants) {
          socket.emit('error', { message: 'Room is full' });
          return;
        }

        const participant: RoomParticipant = {
          deviceId: data.deviceId,
          deviceName: data.deviceName ?? 'Unknown',
          socketId: socket.id,
          isMuted: false,
          joinedAt: new Date(),
        };

        room.participants.set(data.deviceId, participant);
        currentRoomId = room.id;
        currentDeviceId = data.deviceId;

        socket.join(room.id);
        socket.emit('room:joined', serializeRoom(room));
        socket.to(room.id).emit('participant:joined', {
          deviceId: participant.deviceId,
          deviceName: participant.deviceName,
          joinedAt: participant.joinedAt,
        });
        io.emit('room:list', getRoomList());
      },
    );

    socket.on('room:leave', () => {
      handleLeave(socket, io);
    });

    socket.on('room:close', (data: { roomId: string; deviceId: string }) => {
      const room = rooms.get(data.roomId);
      if (!room) return;
      if (room.hostDeviceId !== data.deviceId) {
        socket.emit('error', { message: 'Only the host can close the room' });
        return;
      }

      room.isLive = false;
      io.to(room.id).emit('room:closed', { roomId: room.id });
      rooms.delete(room.id);
      io.emit('room:list', getRoomList());
    });

    socket.on('room:list', () => {
      socket.emit('room:list', getRoomList());
    });

    socket.on('participant:mute', (data: { deviceId: string; isMuted: boolean }) => {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (!room) return;
      const participant = room.participants.get(data.deviceId);
      if (!participant) return;

      participant.isMuted = data.isMuted;
      io.to(currentRoomId).emit('participant:muted', {
        deviceId: data.deviceId,
        isMuted: data.isMuted,
      });
    });

    socket.on('disconnect', () => {
      handleLeave(socket, io);
    });

    function handleLeave(sock: Socket, ioServer: SocketIOServer): void {
      if (!currentRoomId || !currentDeviceId) return;

      const room = rooms.get(currentRoomId);
      if (!room) return;

      room.participants.delete(currentDeviceId);
      sock.leave(currentRoomId);
      sock.to(currentRoomId).emit('participant:left', { deviceId: currentDeviceId });

      if (room.participants.size === 0) {
        rooms.delete(currentRoomId);
      } else if (room.hostDeviceId === currentDeviceId) {
        const nextHost = room.participants.values().next().value as RoomParticipant;
        room.hostDeviceId = nextHost.deviceId;
        ioServer.to(currentRoomId).emit('room:updated', serializeRoom(room));
      }

      sock.emit('room:left', { roomId: currentRoomId });
      ioServer.emit('room:list', getRoomList());

      currentRoomId = null;
      currentDeviceId = null;
    }
  });
}

function getRoomList() {
  return Array.from(rooms.values())
    .filter((r) => r.isLive)
    .map(serializeRoom);
}
