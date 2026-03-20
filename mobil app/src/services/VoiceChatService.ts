import { io, Socket } from 'socket.io-client';
import { API_CONFIG, getDeviceId, registerDevice, setDeviceId } from '../config/api';
import { Platform } from 'react-native';

export interface RoomParticipant {
  deviceId: string;
  deviceName: string;
  isMuted: boolean;
  joinedAt: Date;
}

export interface VoiceRoom {
  id: string;
  name: string;
  topic?: string;
  hostDeviceId: string;
  participantCount: number;
  maxParticipants: number;
  createdAt: Date;
  isLive: boolean;
  participants: RoomParticipant[];
}

export interface CreateRoomData {
  name: string;
  topic?: string;
  maxParticipants?: number;
}

export type VoiceChatEventCallback = {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: { message: string; code: string }) => void;
  onRoomCreated?: (room: VoiceRoom) => void;
  onRoomJoined?: (data: { room: VoiceRoom; participants: RoomParticipant[] }) => void;
  onRoomLeft?: (roomId: string) => void;
  onRoomList?: (rooms: VoiceRoom[]) => void;
  onRoomUpdated?: (room: VoiceRoom) => void;
  onRoomClosed?: (roomId: string) => void;
  onParticipantJoined?: (data: { roomId: string; participant: RoomParticipant }) => void;
  onParticipantLeft?: (data: { roomId: string; deviceId: string }) => void;
  onParticipantMuted?: (data: { roomId: string; deviceId: string; isMuted: boolean }) => void;
};

class VoiceChatService {
  private socket: Socket | null = null;
  private deviceId: string | null = null;
  private callbacks: VoiceChatEventCallback = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(): Promise<boolean> {
    if (this.socket?.connected) {
      return true;
    }

    try {
      this.deviceId = await getDeviceId();
      
      if (!this.deviceId) {
        const platformName = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';
        this.deviceId = await registerDevice(`${platformName} Cihaz`, platformName);
      }

      if (!this.deviceId) {
        // DB kapalıyken / HTTP register başarısızken bile sesli sohbet UI'sını test edebilmek için
        // yerel bir deviceId üretip saklıyoruz. Backend tarafında VOICECHAT_BYPASS_DEVICE_AUTH açık olmalı.
        const gen = (): string => {
          // UUID benzeri (yaklaşık) üretim
          const hex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
          return `${hex()}${hex()}-${hex()}-4${hex().slice(0, 3)}-${hex().slice(0, 4)}-${hex()}${hex()}${hex()}`;
        };
        this.deviceId = gen();
        await setDeviceId(this.deviceId);
        console.warn('Device ID local üretildi (registerDevice başarısız).', this.deviceId);
      }

      const socketUrl = API_CONFIG.baseURL.replace('/api', '');

      this.socket = io(socketUrl, {
        auth: {
          deviceId: this.deviceId,
        },
        extraHeaders: {
          'X-Device-ID': this.deviceId,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.setupEventListeners();

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 10000);

        this.socket?.on('connect', () => {
          clearTimeout(timeout);
          this.reconnectAttempts = 0;
          resolve(true);
        });

        this.socket?.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('Socket bağlantı hatası:', error.message);
          resolve(false);
        });
      });
    } catch (error) {
      console.error('Socket bağlantı hatası:', error);
      return false;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket bağlandı');
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket bağlantısı kesildi:', reason);
      this.callbacks.onDisconnect?.(reason);
    });

    this.socket.on('error', (error: { message: string; code: string }) => {
      console.error('Socket hatası:', error);
      this.callbacks.onError?.(error);
    });

    this.socket.on('room:created', (data: VoiceRoom) => {
      this.callbacks.onRoomCreated?.(data);
    });

    this.socket.on('room:joined', (data: VoiceRoom) => {
      this.callbacks.onRoomJoined?.({ room: data, participants: data.participants ?? [] });
    });

    this.socket.on('room:left', (data: { roomId: string }) => {
      this.callbacks.onRoomLeft?.(data.roomId);
    });

    this.socket.on('room:list', (data: VoiceRoom[] | { rooms: VoiceRoom[] }) => {
      const rooms = Array.isArray(data) ? data : (data?.rooms ?? []);
      this.callbacks.onRoomList?.(rooms);
    });

    this.socket.on('room:updated', (data: { room: VoiceRoom }) => {
      this.callbacks.onRoomUpdated?.(data.room);
    });

    this.socket.on('room:closed', (data: { roomId: string }) => {
      this.callbacks.onRoomClosed?.(data.roomId);
    });

    this.socket.on('participant:joined', (data: { roomId: string; participant: RoomParticipant }) => {
      this.callbacks.onParticipantJoined?.(data);
    });

    this.socket.on('participant:left', (data: { roomId: string; deviceId: string }) => {
      this.callbacks.onParticipantLeft?.(data);
    });

    this.socket.on('participant:muted', (data: { roomId: string; deviceId: string; isMuted: boolean }) => {
      this.callbacks.onParticipantMuted?.(data);
    });
  }

  setCallbacks(callbacks: VoiceChatEventCallback): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getDeviceId(): string | null {
    return this.deviceId;
  }

  createRoom(data: CreateRoomData): void {
    if (!this.socket?.connected) {
      console.error('Socket bağlı değil');
      return;
    }
    this.socket.emit('room:create', {
      ...data,
      deviceId: this.deviceId,
      deviceName: `${Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'} Cihaz`,
    });
  }

  joinRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.error('Socket bağlı değil');
      return;
    }
    this.socket.emit('room:join', {
      roomId,
      deviceId: this.deviceId,
      deviceName: `${Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'} Cihaz`,
    });
  }

  leaveRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.error('Socket bağlı değil');
      return;
    }
    this.socket.emit('room:leave');
  }

  listRooms(): void {
    if (!this.socket?.connected) {
      console.error('Socket bağlı değil');
      return;
    }
    this.socket.emit('room:list');
  }

  closeRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.error('Socket bağlı değil');
      return;
    }
    this.socket.emit('room:close', { roomId, deviceId: this.deviceId });
  }

  setMuted(roomId: string, isMuted: boolean): void {
    if (!this.socket?.connected) {
      console.error('Socket bağlı değil');
      return;
    }
    this.socket.emit('participant:mute', { deviceId: this.deviceId, isMuted });
  }
}

export const voiceChatService = new VoiceChatService();
