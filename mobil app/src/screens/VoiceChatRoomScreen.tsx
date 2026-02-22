import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useVoiceChat } from '../context/VoiceChatContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import Header from '../components/Header';

const VoiceChatRoomScreen = () => {
  const { theme } = useTheme();
  const {
    isConnected,
    isConnecting,
    rooms,
    currentRoom,
    participants,
    isMuted,
    deviceId,
    error,
    connect,
    createRoom,
    joinRoom,
    leaveRoom,
    closeRoom,
    refreshRooms,
    toggleMute,
    clearError,
  } = useVoiceChat();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      connect();
    }
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error, [{ text: 'Tamam', onPress: clearError }]);
    }
  }, [error]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (!isConnected) {
      await connect();
    } else {
      refreshRooms();
    }
    setRefreshing(false);
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      Alert.alert('Uyarı', 'Lütfen oda adı girin.');
      return;
    }
    createRoom({
      name: newRoomName.trim(),
      topic: newRoomTopic.trim() || undefined,
      maxParticipants: 10,
    });
    setNewRoomName('');
    setNewRoomTopic('');
    setShowCreateModal(false);
  };

  const handleJoinRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.participantCount >= room.maxParticipants) {
      Alert.alert('Dolu', 'Bu oda dolu.');
      return;
    }
    joinRoom(roomId);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  const handleCloseRoom = () => {
    Alert.alert(
      'Odayı Kapat',
      'Odayı kapatmak istediğinize emin misiniz? Tüm katılımcılar çıkarılacak.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kapat', style: 'destructive', onPress: closeRoom },
      ]
    );
  };

  const isHost = currentRoom?.hostDeviceId === deviceId;

  if (isConnecting) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <Header title="Sesli Sohbet Odaları" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Bağlanıyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Header
        title="Sesli Sohbet Odaları"
        rightAction={
          <View style={styles.headerRight}>
            <View
              style={[
                styles.connectionIndicator,
                { backgroundColor: isConnected ? theme.colors.success : theme.colors.error },
              ]}
            />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {!isConnected && (
          <TouchableOpacity
            style={[styles.reconnectButton, { backgroundColor: theme.colors.primary }]}
            onPress={connect}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.reconnectButtonText}>Yeniden Bağlan</Text>
          </TouchableOpacity>
        )}

        {currentRoom ? (
          <View style={[styles.currentRoomCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
            <View style={styles.currentRoomHeader}>
              <View style={styles.currentRoomInfo}>
                <Text style={[styles.currentRoomName, { color: theme.colors.text }]}>
                  {currentRoom.name}
                </Text>
                {currentRoom.topic && (
                  <Text style={[styles.currentRoomTopic, { color: theme.colors.textSecondary }]}>
                    {currentRoom.topic}
                  </Text>
                )}
              </View>
              <View style={[styles.liveBadgeLarge, { backgroundColor: theme.colors.success }]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTextLarge}>Canlı</Text>
              </View>
            </View>

            <View style={styles.participantsList}>
              <Text style={[styles.participantsTitle, { color: theme.colors.text }]}>
                Katılımcılar ({participants.length})
              </Text>
              {participants.map((participant) => (
                <View key={participant.deviceId} style={styles.participantItem}>
                  <View style={[styles.participantAvatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.participantAvatarText}>
                      {participant.deviceName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.participantName, { color: theme.colors.text }]}>
                    {participant.deviceName}
                    {participant.deviceId === deviceId && ' (Sen)'}
                    {participant.deviceId === currentRoom.hostDeviceId && ' (Host)'}
                  </Text>
                  <Ionicons
                    name={participant.isMuted ? 'mic-off' : 'mic'}
                    size={18}
                    color={participant.isMuted ? theme.colors.error : theme.colors.success}
                  />
                </View>
              ))}
            </View>

            <View style={styles.currentRoomActions}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: isMuted ? `${theme.colors.error}20` : `${theme.colors.success}20` },
                ]}
                onPress={toggleMute}
              >
                <Ionicons
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={24}
                  color={isMuted ? theme.colors.error : theme.colors.success}
                />
                <Text style={[styles.actionButtonText, { color: isMuted ? theme.colors.error : theme.colors.success }]}>
                  {isMuted ? 'Sessiz' : 'Açık'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${theme.colors.error}20` }]}
                onPress={handleLeaveRoom}
              >
                <Ionicons name="exit-outline" size={24} color={theme.colors.error} />
                <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Çık</Text>
              </TouchableOpacity>

              {isHost && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: `${theme.colors.error}20` }]}
                  onPress={handleCloseRoom}
                >
                  <Ionicons name="close-circle-outline" size={24} color={theme.colors.error} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Kapat</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: isConnected ? theme.colors.primary : theme.colors.border },
              ]}
              onPress={() => setShowCreateModal(true)}
              disabled={!isConnected}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.createButtonText}>Oda Oluştur</Text>
            </TouchableOpacity>

            {showCreateModal && (
              <View style={[styles.modalOverlay, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Yeni oda oluştur</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="Oda adı"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={newRoomName}
                  onChangeText={setNewRoomName}
                  autoFocus
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="Konu (opsiyonel)"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={newRoomTopic}
                  onChangeText={setNewRoomTopic}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.colors.border }]}
                    onPress={() => setShowCreateModal(false)}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleCreateRoom}
                  >
                    <Text style={styles.modalButtonText}>Oluştur</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {!currentRoom && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Aktif odalar ({rooms.length})
            </Text>
            {rooms.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
                <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                  Henüz aktif oda yok
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                  İlk odayı sen oluştur!
                </Text>
              </View>
            ) : (
              rooms.map((room) => (
                <View
                  key={room.id}
                  style={[
                    styles.roomCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.roomIcon}>
                    <Ionicons
                      name="mic"
                      size={28}
                      color={room.isLive ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    {room.isLive && (
                      <View style={[styles.liveBadge, { backgroundColor: theme.colors.success }]}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>Canlı</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.roomInfo}>
                    <Text style={[styles.roomName, { color: theme.colors.text }]} numberOfLines={1}>
                      {room.name}
                    </Text>
                    {room.topic && (
                      <Text style={[styles.roomTopic, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                        {room.topic}
                      </Text>
                    )}
                    <Text style={[styles.roomMeta, { color: theme.colors.textSecondary }]}>
                      {room.participantCount}/{room.maxParticipants} katılımcı
                    </Text>
                  </View>
                  <View style={styles.roomActions}>
                    <TouchableOpacity
                      style={[
                        styles.joinButton,
                        {
                          backgroundColor:
                            room.participantCount >= room.maxParticipants
                              ? `${theme.colors.border}50`
                              : `${theme.colors.primary}20`,
                        },
                      ]}
                      onPress={() => handleJoinRoom(room.id)}
                      disabled={!isConnected || room.participantCount >= room.maxParticipants}
                    >
                      <Ionicons
                        name="enter-outline"
                        size={20}
                        color={
                          room.participantCount >= room.maxParticipants
                            ? theme.colors.textSecondary
                            : theme.colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.joinButtonText,
                          {
                            color:
                              room.participantCount >= room.maxParticipants
                                ? theme.colors.textSecondary
                                : theme.colors.primary,
                          },
                        ]}
                      >
                        {room.participantCount >= room.maxParticipants ? 'Dolu' : 'Katıl'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Sesli sohbet odalarına katılarak diğer dinleyicilerle sohbet edebilirsiniz.
            {deviceId && `\nCihaz ID: ${deviceId.slice(0, 8)}...`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.base,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
  reconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.base,
    marginTop: spacing.base,
  },
  reconnectButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: '#fff',
  },
  currentRoomCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    marginTop: spacing.base,
  },
  currentRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  currentRoomInfo: {
    flex: 1,
  },
  currentRoomName: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
  },
  currentRoomTopic: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    marginTop: spacing.xs,
  },
  liveBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  liveTextLarge: {
    fontSize: 12,
    fontFamily: typography.fontFamily.semiBold,
    color: '#fff',
  },
  participantsList: {
    marginBottom: spacing.lg,
  },
  participantsTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    marginBottom: spacing.md,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantAvatarText: {
    color: '#fff',
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
  },
  participantName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
  currentRoomActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.base,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.xl,
    marginTop: spacing.base,
    marginBottom: spacing.lg,
  },
  createButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: '#fff',
  },
  modalOverlay: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.base,
  },
  input: {
    height: 48,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.base,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.base,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: '#fff',
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.base,
  },
  emptyState: {
    padding: spacing['2xl'],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  roomIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(19, 127, 236, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  liveBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.semiBold,
    color: '#fff',
  },
  roomInfo: {
    flex: 1,
    minWidth: 0,
  },
  roomName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
  },
  roomTopic: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    marginTop: 2,
  },
  roomMeta: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginTop: 4,
  },
  roomActions: {
    marginLeft: spacing.sm,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.base,
  },
  joinButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
    padding: spacing.base,
  },
  footerText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 20,
  },
});

export default VoiceChatRoomScreen;
