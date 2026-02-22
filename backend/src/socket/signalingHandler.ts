import { Socket, Server } from 'socket.io';
import { roomManager } from './roomManager';
import {
  WebRTCOffer,
  WebRTCAnswer,
  ICECandidate,
  WebRTCOfferPayload,
  WebRTCAnswerPayload,
  ICECandidatePayload,
} from '../types';
import { logger } from '../utils';

function isValidSessionDescription(obj: unknown): obj is { type?: string; sdp?: string } {
  return obj !== null && typeof obj === 'object';
}

function isValidIceCandidate(obj: unknown): obj is Record<string, unknown> {
  return obj !== null && typeof obj === 'object';
}

export function setupSignalingHandlers(socket: Socket, io: Server): void {
  const deviceId = socket.data.deviceId as string;

  socket.on('webrtc:offer', (data: WebRTCOffer) => {
    if (
      !data ||
      typeof data.roomId !== 'string' ||
      !data.roomId.trim() ||
      typeof data.targetDeviceId !== 'string' ||
      !data.targetDeviceId.trim() ||
      !isValidSessionDescription(data.offer)
    ) {
      socket.emit('error', { message: 'Geçersiz offer verisi', code: 'INVALID_PAYLOAD' });
      return;
    }
    handleOffer(socket, io, deviceId, data);
  });

  socket.on('webrtc:answer', (data: WebRTCAnswer) => {
    if (
      !data ||
      typeof data.roomId !== 'string' ||
      !data.roomId.trim() ||
      typeof data.targetDeviceId !== 'string' ||
      !data.targetDeviceId.trim() ||
      !isValidSessionDescription(data.answer)
    ) {
      socket.emit('error', { message: 'Geçersiz answer verisi', code: 'INVALID_PAYLOAD' });
      return;
    }
    handleAnswer(socket, io, deviceId, data);
  });

  socket.on('webrtc:ice-candidate', (data: ICECandidate) => {
    if (
      !data ||
      typeof data.roomId !== 'string' ||
      !data.roomId.trim() ||
      typeof data.targetDeviceId !== 'string' ||
      !data.targetDeviceId.trim() ||
      !isValidIceCandidate(data.candidate)
    ) {
      socket.emit('error', { message: 'Geçersiz ICE candidate verisi', code: 'INVALID_PAYLOAD' });
      return;
    }
    handleIceCandidate(socket, io, deviceId, data);
  });
}

function handleOffer(
  socket: Socket,
  io: Server,
  fromDeviceId: string,
  data: WebRTCOffer
): void {
  const { roomId, targetDeviceId, offer } = data;

  const room = roomManager.getRoom(roomId);
  if (!room) {
    socket.emit('error', { message: 'Oda bulunamadı', code: 'ROOM_NOT_FOUND' });
    return;
  }

  if (!room.participants.has(fromDeviceId)) {
    socket.emit('error', { message: 'Bu odada değilsiniz', code: 'NOT_IN_ROOM' });
    return;
  }

  const targetSocketId = roomManager.getParticipantSocketId(roomId, targetDeviceId);
  if (!targetSocketId) {
    socket.emit('error', {
      message: 'Hedef katılımcı bulunamadı',
      code: 'TARGET_NOT_FOUND',
    });
    return;
  }

  const payload: WebRTCOfferPayload = {
    fromDeviceId,
    offer,
  };

  io.to(targetSocketId).emit('webrtc:offer', payload);
  logger.debug(`WebRTC offer from ${fromDeviceId} to ${targetDeviceId} in room ${roomId}`);
}

function handleAnswer(
  socket: Socket,
  io: Server,
  fromDeviceId: string,
  data: WebRTCAnswer
): void {
  const { roomId, targetDeviceId, answer } = data;

  const room = roomManager.getRoom(roomId);
  if (!room) {
    socket.emit('error', { message: 'Oda bulunamadı', code: 'ROOM_NOT_FOUND' });
    return;
  }

  if (!room.participants.has(fromDeviceId)) {
    socket.emit('error', { message: 'Bu odada değilsiniz', code: 'NOT_IN_ROOM' });
    return;
  }

  const targetSocketId = roomManager.getParticipantSocketId(roomId, targetDeviceId);
  if (!targetSocketId) {
    socket.emit('error', {
      message: 'Hedef katılımcı bulunamadı',
      code: 'TARGET_NOT_FOUND',
    });
    return;
  }

  const payload: WebRTCAnswerPayload = {
    fromDeviceId,
    answer,
  };

  io.to(targetSocketId).emit('webrtc:answer', payload);
  logger.debug(`WebRTC answer from ${fromDeviceId} to ${targetDeviceId} in room ${roomId}`);
}

function handleIceCandidate(
  socket: Socket,
  io: Server,
  fromDeviceId: string,
  data: ICECandidate
): void {
  const { roomId, targetDeviceId, candidate } = data;

  const room = roomManager.getRoom(roomId);
  if (!room) {
    socket.emit('error', { message: 'Oda bulunamadı', code: 'ROOM_NOT_FOUND' });
    return;
  }

  if (!room.participants.has(fromDeviceId)) {
    socket.emit('error', { message: 'Bu odada değilsiniz', code: 'NOT_IN_ROOM' });
    return;
  }

  const targetSocketId = roomManager.getParticipantSocketId(roomId, targetDeviceId);
  if (!targetSocketId) {
    return;
  }

  const payload: ICECandidatePayload = {
    fromDeviceId,
    candidate,
  };

  io.to(targetSocketId).emit('webrtc:ice-candidate', payload);
  logger.debug(`ICE candidate from ${fromDeviceId} to ${targetDeviceId} in room ${roomId}`);
}
