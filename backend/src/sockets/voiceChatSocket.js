const { v4: uuidv4 } = require('uuid');

/**
 * In-memory voice chat room manager for socket.io.
 * This is intentionally simple: rooms live only while the backend process is running.
 */
function serializeRoom(room) {
  return {
    id: room.id,
    name: room.name,
    topic: room.topic,
    hostDeviceId: room.hostDeviceId,
    participantCount: room.participants.length,
    maxParticipants: room.maxParticipants,
    createdAt: room.createdAt,
    isLive: true,
    participants: room.participants,
  };
}

function findParticipant(room, deviceId) {
  return room.participants.find((p) => p.deviceId === deviceId);
}

function removeParticipant(room, deviceId) {
  room.participants = room.participants.filter((p) => p.deviceId !== deviceId);
}

function createRoom({ deviceId, deviceName, name, topic, maxParticipants }) {
  return {
    id: uuidv4(),
    name,
    topic,
    hostDeviceId: deviceId,
    participants: [
      // host starts as participant
      {
        deviceId,
        deviceName,
        isMuted: false,
        joinedAt: new Date(),
      },
    ],
    maxParticipants: maxParticipants || 10,
    createdAt: new Date(),
  };
}

function registerVoiceChatSocket(io, { pool, logger }) {
  const rooms = new Map(); // roomId -> room
  const socketState = new Map(); // socket.id -> { deviceId, currentRoomId }

  function safePayload(obj, maxLen = 500) {
    try {
      const s = JSON.stringify(obj);
      if (s.length <= maxLen) return obj;
      return { ...obj, _truncated: true, _len: s.length };
    } catch {
      return { _unserializable: true };
    }
  }

  async function validateDevice(deviceId) {
    const bypass = String(process.env.VOICECHAT_BYPASS_DEVICE_AUTH || '').toLowerCase() === 'true';
    if (bypass) {
      if (!deviceId) return null;
      return { id: deviceId, deviceName: 'Bypass Device' };
    }
    if (!deviceId) return null;
    const [rows] = await pool.query('SELECT id, device_name FROM device_tokens WHERE id = ? LIMIT 1', [deviceId]);
    if (!rows.length) return null;
    return { id: rows[0].id, deviceName: rows[0].device_name };
  }

  function broadcastRoomList() {
    const list = Array.from(rooms.values()).map(serializeRoom);
    io.emit('room:list', list);
  }

  function broadcastRoomUpdated(room) {
    io.emit('room:updated', serializeRoom(room));
  }

  io.on('connection', async (socket) => {
    try {
      const deviceId = socket.handshake?.auth?.deviceId || socket.handshake?.headers?.['x-device-id'];
      logger?.info?.('voiceChatSocket.handshake', {
        socketId: socket.id,
        deviceId: deviceId || null,
        authHasDeviceId: Boolean(socket.handshake?.auth?.deviceId),
        transport: socket.handshake?.query?.transport || null,
      });
      const validated = await validateDevice(deviceId);
      if (!validated) {
        socket.emit('connect_error', { message: 'Invalid deviceId', code: 'EINVALID_DEVICE' });
        socket.disconnect(true);
        return;
      }

      socketState.set(socket.id, { deviceId: validated.id, currentRoomId: null });
      logger?.info?.('voiceChatSocket.connected', { socketId: socket.id, deviceId: validated.id });
    } catch (e) {
      logger?.error?.('voiceChatSocket.connection.validate.failed', { message: e.message, stack: e.stack });
      socket.disconnect(true);
    }

    socket.on('room:create', async (payload) => {
      const st = socketState.get(socket.id);
      if (!st) return;

      const { deviceId, deviceName, name, topic, maxParticipants } = payload || {};
      const roomName = String(name || '').trim();
      if (!roomName) {
        logger?.warn?.('voiceChatSocket.room:create.invalidName', {
          socketId: socket.id,
          deviceId: st.deviceId,
          payload: safePayload(payload),
        });
        return;
      }

      // Only allow creator to be the host
      const hostDeviceId = st.deviceId || deviceId;
      const hostName = deviceName || 'Cihaz';

      logger?.info?.('voiceChatSocket.room:create', {
        socketId: socket.id,
        deviceId: st.deviceId,
        hostDeviceId,
        name: roomName,
        topic: topic ? String(topic).slice(0, 120) : undefined,
        maxParticipants: Number.isFinite(Number(maxParticipants)) ? Number(maxParticipants) : 10,
      });

      const room = createRoom({
        deviceId: hostDeviceId,
        deviceName: hostName,
        name: roomName,
        topic: topic ? String(topic) : undefined,
        maxParticipants: Number.isFinite(Number(maxParticipants)) ? Number(maxParticipants) : 10,
      });

      rooms.set(room.id, room);
      st.currentRoomId = room.id;

      socket.join(room.id);

      socket.emit('room:created', serializeRoom(room));
      broadcastRoomUpdated(room);
      broadcastRoomList();
    });

    socket.on('room:list', () => {
      const st = socketState.get(socket.id);
      logger?.info?.('voiceChatSocket.room:list', {
        socketId: socket.id,
        deviceId: st?.deviceId || null,
        roomsCount: rooms.size,
      });
      const list = Array.from(rooms.values()).map(serializeRoom);
      socket.emit('room:list', list);
    });

    socket.on('room:join', async (payload) => {
      const st = socketState.get(socket.id);
      if (!st) return;

      const { roomId, deviceId, deviceName } = payload || {};
      const room = rooms.get(roomId);
      if (!room) {
        logger?.warn?.('voiceChatSocket.room:join.notFound', {
          socketId: socket.id,
          deviceId: st.deviceId,
          roomId,
        });
        return;
      }
      if (room.participants.length >= room.maxParticipants) {
        logger?.warn?.('voiceChatSocket.room:join.full', {
          socketId: socket.id,
          deviceId: st.deviceId,
          roomId,
          participants: room.participants.length,
          maxParticipants: room.maxParticipants,
        });
        return;
      }

      // Prevent joining with mismatched deviceId
      const joinDeviceId = st.deviceId || deviceId;
      const joinName = deviceName || 'Cihaz';

      logger?.info?.('voiceChatSocket.room:join', {
        socketId: socket.id,
        deviceId: st.deviceId,
        roomId,
        existingParticipant: Boolean(findParticipant(room, joinDeviceId)),
      });

      const existing = findParticipant(room, joinDeviceId);
      if (existing) {
        st.currentRoomId = room.id;
        socket.join(room.id);
        socket.emit('room:joined', serializeRoom(room));
        return;
      }

      room.participants.push({
        deviceId: joinDeviceId,
        deviceName: joinName,
        isMuted: false,
        joinedAt: new Date(),
      });

      st.currentRoomId = room.id;
      socket.join(room.id);

      const serialized = serializeRoom(room);
      io.emit('participant:joined', { roomId: room.id, participant: serialized.participants.find((p) => p.deviceId === joinDeviceId) });
      io.emit('room:updated', serialized);
      broadcastRoomList();

      // Reply to joiner
      socket.emit('room:joined', serialized);
    });

    socket.on('room:leave', () => {
      const st = socketState.get(socket.id);
      if (!st || !st.currentRoomId) return;

      const roomId = st.currentRoomId;
      const room = rooms.get(roomId);
      if (!room) {
        logger?.warn?.('voiceChatSocket.room:leave.roomMissing', {
          socketId: socket.id,
          deviceId: st.deviceId,
          roomId,
        });
        st.currentRoomId = null;
        return;
      }

      const deviceId = st.deviceId;
      logger?.info?.('voiceChatSocket.room:leave', { socketId: socket.id, deviceId, roomId });
      removeParticipant(room, deviceId);

      st.currentRoomId = null;
      socket.leave(roomId);

      const serialized = serializeRoom(room);
      io.emit('participant:left', { roomId, deviceId });
      io.emit('room:updated', serialized);
      broadcastRoomList();

      io.emit('room:left', { roomId });
      // If host left, close room automatically
      if (room.hostDeviceId === deviceId || room.participants.length === 0) {
        rooms.delete(roomId);
        io.emit('room:closed', { roomId });
        broadcastRoomList();
      }
    });

    socket.on('room:close', async (payload) => {
      const st = socketState.get(socket.id);
      if (!st) return;

      const { roomId, deviceId } = payload || {};
      const room = rooms.get(roomId);
      if (!room) return;
      const callerDeviceId = st.deviceId || deviceId;

      if (room.hostDeviceId !== callerDeviceId) return; // only host can close
      logger?.warn?.('voiceChatSocket.room:close', {
        socketId: socket.id,
        hostDeviceId: room.hostDeviceId,
        callerDeviceId,
        roomId,
      });

      rooms.delete(roomId);
      io.emit('room:closed', { roomId });
      io.emit('room:left', { roomId });
      broadcastRoomList();
    });

    socket.on('participant:mute', (payload) => {
      const st = socketState.get(socket.id);
      if (!st || !st.currentRoomId) return;
      const roomId = st.currentRoomId;
      const room = rooms.get(roomId);
      if (!room) return;

      const { isMuted, deviceId } = payload || {};
      const targetDeviceId = st.deviceId || deviceId;

      const p = findParticipant(room, targetDeviceId);
      if (!p) {
        logger?.warn?.('voiceChatSocket.participant:mute.participantMissing', {
          socketId: socket.id,
          roomId,
          targetDeviceId,
        });
        return;
      }
      p.isMuted = Boolean(isMuted);

      logger?.info?.('voiceChatSocket.participant:mute', {
        socketId: socket.id,
        roomId,
        deviceId: targetDeviceId,
        isMuted: p.isMuted,
      });
      io.emit('participant:muted', { roomId, deviceId: targetDeviceId, isMuted: p.isMuted });
      io.emit('room:updated', serializeRoom(room));
    });

    socket.on('disconnect', (reason) => {
      const st = socketState.get(socket.id);
      if (!st) return;
      logger?.info?.('voiceChatSocket.disconnect', {
        socketId: socket.id,
        deviceId: st.deviceId,
        currentRoomId: st.currentRoomId,
        reason,
      });

      if (st.currentRoomId) {
        const roomId = st.currentRoomId;
        const room = rooms.get(roomId);
        if (room) {
          removeParticipant(room, st.deviceId);
          io.emit('participant:left', { roomId, deviceId: st.deviceId });
          const serialized = serializeRoom(room);
          io.emit('room:updated', serialized);
          broadcastRoomList();

          if (room.hostDeviceId === st.deviceId || room.participants.length === 0) {
            rooms.delete(roomId);
            io.emit('room:closed', { roomId });
            broadcastRoomList();
          }
        }
      }
      socketState.delete(socket.id);
      logger?.info?.('voiceChatSocket.disconnect', { socketId: socket.id, reason });
    });
  });
}

module.exports = { registerVoiceChatSocket };

