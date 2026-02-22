import { Request } from 'express';
import { Device } from '../entities/Device';

// Extended Request with Device
export interface DeviceRequest extends Request {
  device?: Device;
  deviceId?: string;
}

// Extended Request for Admin
export interface AdminRequest extends Request {
  isAdmin?: boolean;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Query Parameters
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface BookFilterQuery extends PaginationQuery {
  category?: string;
  search?: string;
  featured?: string;
  sortBy?: 'title' | 'author' | 'rating' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

// DTOs (Data Transfer Objects)
export interface CreateBookDTO {
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  coverImage?: string;
  categoryId?: number;
  isFeatured?: boolean;
}

export interface UpdateBookDTO extends Partial<CreateBookDTO> {
  isActive?: boolean;
}

export interface CreateChapterDTO {
  bookId: number;
  title: string;
  orderNum: number;
  audioUrl: string;
  duration?: number;
}

export interface UpdateChapterDTO extends Partial<Omit<CreateChapterDTO, 'bookId'>> {}

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

export interface RegisterDeviceDTO {
  deviceName?: string;
  platform?: string;
}

export interface SaveProgressDTO {
  chapterId?: number;
  currentTime: number;
  isCompleted?: boolean;
}

export interface CreateReviewDTO {
  rating: number;
  comment?: string;
  reviewerName?: string;
}

// Stats Types
export interface DeviceStats {
  totalBooksStarted: number;
  totalBooksCompleted: number;
  totalListeningTime: number;
  favoritesCount: number;
  reviewsCount: number;
}

export interface AdminStats {
  totalBooks: number;
  totalChapters: number;
  totalDevices: number;
  totalCategories: number;
  recentDevices: number;
  popularBooks: Array<{
    id: number;
    title: string;
    listenerCount: number;
  }>;
}

// ==========================================
// Voice Chat Room Types
// ==========================================

export interface RoomParticipant {
  deviceId: string;
  deviceName: string;
  isMuted: boolean;
  joinedAt: Date;
  socketId: string;
}

export interface VoiceRoom {
  id: string;
  name: string;
  topic?: string;
  hostDeviceId: string;
  participants: Map<string, RoomParticipant>;
  maxParticipants: number;
  createdAt: Date;
  isLive: boolean;
}

export interface VoiceRoomPublic {
  id: string;
  name: string;
  topic?: string;
  hostDeviceId: string;
  participantCount: number;
  maxParticipants: number;
  createdAt: Date;
  isLive: boolean;
  participants: Array<Omit<RoomParticipant, 'socketId'>>;
}

export interface CreateRoomDTO {
  name: string;
  topic?: string;
  maxParticipants?: number;
}

export interface JoinRoomDTO {
  roomId: string;
}

export interface LeaveRoomDTO {
  roomId: string;
}

export interface MuteDTO {
  roomId: string;
  isMuted: boolean;
}

// WebRTC Signaling Types
export interface WebRTCOffer {
  roomId: string;
  targetDeviceId: string;
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswer {
  roomId: string;
  targetDeviceId: string;
  answer: RTCSessionDescriptionInit;
}

export interface ICECandidate {
  roomId: string;
  targetDeviceId: string;
  candidate: RTCIceCandidateInit;
}

export interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer';
  sdp?: string;
}

export interface RTCIceCandidateInit {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
}

// Socket Event Payloads
export interface SocketErrorPayload {
  message: string;
  code: string;
}

export interface ParticipantJoinedPayload {
  roomId: string;
  participant: Omit<RoomParticipant, 'socketId'>;
}

export interface ParticipantLeftPayload {
  roomId: string;
  deviceId: string;
}

export interface ParticipantMutedPayload {
  roomId: string;
  deviceId: string;
  isMuted: boolean;
}

export interface WebRTCOfferPayload {
  fromDeviceId: string;
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswerPayload {
  fromDeviceId: string;
  answer: RTCSessionDescriptionInit;
}

export interface ICECandidatePayload {
  fromDeviceId: string;
  candidate: RTCIceCandidateInit;
}
