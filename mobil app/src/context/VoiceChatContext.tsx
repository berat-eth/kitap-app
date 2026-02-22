import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  voiceChatService,
  VoiceRoom,
  RoomParticipant,
  CreateRoomData,
} from '../services/VoiceChatService';

interface VoiceChatState {
  isConnected: boolean;
  isConnecting: boolean;
  rooms: VoiceRoom[];
  currentRoom: VoiceRoom | null;
  participants: RoomParticipant[];
  isMuted: boolean;
  deviceId: string | null;
  error: string | null;
}

interface VoiceChatContextType extends VoiceChatState {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  createRoom: (data: CreateRoomData) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  closeRoom: () => void;
  refreshRooms: () => void;
  toggleMute: () => void;
  clearError: () => void;
}

const VoiceChatContext = createContext<VoiceChatContextType | undefined>(undefined);

export const useVoiceChat = () => {
  const context = useContext(VoiceChatContext);
  if (!context) {
    throw new Error('useVoiceChat must be used within VoiceChatProvider');
  }
  return context;
};

interface VoiceChatProviderProps {
  children: ReactNode;
}

export const VoiceChatProvider: React.FC<VoiceChatProviderProps> = ({ children }) => {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isConnecting: false,
    rooms: [],
    currentRoom: null,
    participants: [],
    isMuted: false,
    deviceId: null,
    error: null,
  });

  useEffect(() => {
    voiceChatService.setCallbacks({
      onConnect: () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          deviceId: voiceChatService.getDeviceId(),
        }));
        voiceChatService.listRooms();
      },

      onDisconnect: (reason) => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          currentRoom: null,
          participants: [],
        }));
        if (reason === 'io server disconnect') {
          setState((prev) => ({ ...prev, error: 'Sunucu bağlantıyı kesti' }));
        }
      },

      onError: (error) => {
        setState((prev) => ({ ...prev, error: error.message }));
      },

      onRoomList: (rooms) => {
        setState((prev) => ({ ...prev, rooms }));
      },

      onRoomCreated: (room) => {
        setState((prev) => ({
          ...prev,
          currentRoom: room,
          participants: room.participants,
          rooms: [room, ...prev.rooms.filter((r) => r.id !== room.id)],
        }));
      },

      onRoomJoined: ({ room, participants }) => {
        setState((prev) => ({
          ...prev,
          currentRoom: room,
          participants,
        }));
      },

      onRoomLeft: () => {
        setState((prev) => ({
          ...prev,
          currentRoom: null,
          participants: [],
          isMuted: false,
        }));
        voiceChatService.listRooms();
      },

      onRoomUpdated: (room) => {
        setState((prev) => {
          const updatedRooms = prev.rooms.map((r) => (r.id === room.id ? room : r));
          return {
            ...prev,
            rooms: updatedRooms,
            currentRoom: prev.currentRoom?.id === room.id ? room : prev.currentRoom,
          };
        });
      },

      onRoomClosed: (roomId) => {
        setState((prev) => {
          const isCurrentRoom = prev.currentRoom?.id === roomId;
          return {
            ...prev,
            rooms: prev.rooms.filter((r) => r.id !== roomId),
            currentRoom: isCurrentRoom ? null : prev.currentRoom,
            participants: isCurrentRoom ? [] : prev.participants,
            error: isCurrentRoom ? 'Oda kapatıldı' : prev.error,
          };
        });
      },

      onParticipantJoined: ({ roomId, participant }) => {
        setState((prev) => {
          if (prev.currentRoom?.id !== roomId) return prev;
          const exists = prev.participants.some((p) => p.deviceId === participant.deviceId);
          if (exists) return prev;
          return {
            ...prev,
            participants: [...prev.participants, participant],
          };
        });
      },

      onParticipantLeft: ({ roomId, deviceId }) => {
        setState((prev) => {
          if (prev.currentRoom?.id !== roomId) return prev;
          return {
            ...prev,
            participants: prev.participants.filter((p) => p.deviceId !== deviceId),
          };
        });
      },

      onParticipantMuted: ({ roomId, deviceId, isMuted }) => {
        setState((prev) => {
          if (prev.currentRoom?.id !== roomId) return prev;
          
          const myDeviceId = voiceChatService.getDeviceId();
          if (deviceId === myDeviceId) {
            return { ...prev, isMuted };
          }

          return {
            ...prev,
            participants: prev.participants.map((p) =>
              p.deviceId === deviceId ? { ...p, isMuted } : p
            ),
          };
        });
      },
    });

    return () => {
      voiceChatService.disconnect();
    };
  }, []);

  const connect = useCallback(async (): Promise<boolean> => {
    if (state.isConnected || state.isConnecting) {
      return state.isConnected;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));
    const success = await voiceChatService.connect();

    if (!success) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: 'Bağlantı kurulamadı',
      }));
    }

    return success;
  }, [state.isConnected, state.isConnecting]);

  const disconnect = useCallback(() => {
    voiceChatService.disconnect();
    setState((prev) => ({
      ...prev,
      isConnected: false,
      currentRoom: null,
      participants: [],
      rooms: [],
    }));
  }, []);

  const createRoom = useCallback((data: CreateRoomData) => {
    voiceChatService.createRoom(data);
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    voiceChatService.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback(() => {
    if (state.currentRoom) {
      voiceChatService.leaveRoom(state.currentRoom.id);
    }
  }, [state.currentRoom]);

  const closeRoom = useCallback(() => {
    if (state.currentRoom) {
      voiceChatService.closeRoom(state.currentRoom.id);
    }
  }, [state.currentRoom]);

  const refreshRooms = useCallback(() => {
    voiceChatService.listRooms();
  }, []);

  const toggleMute = useCallback(() => {
    if (state.currentRoom) {
      const newMuted = !state.isMuted;
      voiceChatService.setMuted(state.currentRoom.id, newMuted);
      setState((prev) => ({ ...prev, isMuted: newMuted }));
    }
  }, [state.currentRoom, state.isMuted]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: VoiceChatContextType = {
    ...state,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    closeRoom,
    refreshRooms,
    toggleMute,
    clearError,
  };

  return (
    <VoiceChatContext.Provider value={value}>
      {children}
    </VoiceChatContext.Provider>
  );
};
