import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import { mockBooks } from '../utils/mockData';
import SeekBar from '../components/ProgressBar';
import AudioControls from '../components/AudioControls';

type AudioPlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AudioPlayer'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COVER_SIZE = Math.min(SCREEN_WIDTH - spacing.xl * 2, SCREEN_HEIGHT * 0.35);

type Tab = 'player' | 'chapters' | 'transcript';

const AudioPlayerScreen = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const route = useRoute();
  const navigation = useNavigation<AudioPlayerScreenNavigationProp>();
  const {
    playerState,
    play,
    pause,
    resume,
    seek,
    setPlaybackRate,
    setVolume,
    toggleMute,
    nextChapter,
    previousChapter,
    setSleepTimer,
    clearSleepTimer,
  } = useAudioPlayer();

  const { bookId } = route.params as { bookId: string };
  const book = mockBooks.find((b) => b.id === bookId);

  const [activeTab, setActiveTab] = useState<Tab>('player');
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Kapak animasyonu — çalarken hafif büyür
  const coverScale = useRef(new Animated.Value(1)).current;
  const coverRotate = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (playerState.isPlaying) {
      Animated.spring(coverScale, { toValue: 1.04, useNativeDriver: true, friction: 6 }).start();
      rotateAnim.current = Animated.loop(
        Animated.timing(coverRotate, { toValue: 1, duration: 20000, useNativeDriver: true }),
      );
      rotateAnim.current.start();
    } else {
      Animated.spring(coverScale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
      rotateAnim.current?.stop();
    }
  }, [playerState.isPlaying]);

  if (!book) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text, padding: spacing.xl }}>Kitap bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const currentChapter = playerState.currentChapter || book.chapters?.[0];
  const chapterIndex = book.chapters?.findIndex((c) => c.id === currentChapter?.id) ?? 0;
  const totalChapters = book.chapters?.length ?? 0;
  const progress =
    playerState.duration > 0 && !isNaN(playerState.duration)
      ? (playerState.position / playerState.duration) * 100
      : 0;
  const remaining = Math.max(0, playerState.duration - playerState.position);

  const formatTime = (s: number) => {
    if (isNaN(s) || s < 0) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (playerState.isPlaying) {
      pause();
    } else if (playerState.currentBook) {
      resume();
    } else {
      play(book, currentChapter);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
    const idx = speeds.findIndex((s) => Math.abs(s - playerState.playbackRate) < 0.1);
    setPlaybackRate(speeds[(idx + 1) % speeds.length]);
  };

  const spin = coverRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Gradient renkler — kitap kapağına göre değişebilir, şimdilik tema bazlı
  const gradientColors: [string, string, string] = isDark
    ? ['#0d1b2a', '#1a2f45', '#0d1b2a']
    : ['#e8f4fd', '#c8e6f9', '#f0f8ff'];

  const accentColor = '#137fec';

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0d1b2a' : '#f0f8ff' }]}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-down" size={28} color={isDark ? '#fff' : '#111'} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerLabel, { color: isDark ? '#9ca3af' : '#637588' }]}>
              ŞİMDİ DİNLENİYOR
            </Text>
            <Text
              style={[styles.headerTitle, { color: isDark ? '#fff' : '#111' }]}
              numberOfLines={1}
            >
              {book.title}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {playerState.sleepTimerMinutes ? (
              <TouchableOpacity
                style={[styles.sleepBadge, { backgroundColor: accentColor }]}
                onPress={() => setSleepModalVisible(true)}
              >
                <Ionicons name="moon" size={13} color="#fff" />
                <Text style={styles.sleepBadgeText}>{playerState.sleepTimerMinutes}dk</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.iconBtn} onPress={() => setSleepModalVisible(true)}>
                <Ionicons name="moon-outline" size={24} color={isDark ? '#fff' : '#111'} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconBtn} onPress={() => setIsLiked((v) => !v)}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={isLiked ? '#ef4444' : isDark ? '#fff' : '#111'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tab Bar ── */}
        <View style={[styles.tabBar, { borderBottomColor: isDark ? '#1e3a5f' : '#d1e9f7' }]}>
          {(['player', 'chapters', 'transcript'] as Tab[]).map((tab) => {
            const labels: Record<Tab, string> = {
              player: 'Oynatıcı',
              chapters: `Bölümler (${totalChapters})`,
              transcript: 'Transkript',
            };
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: active ? accentColor : isDark ? '#6b7280' : '#9ca3af',
                      fontFamily: active ? typography.fontFamily.bold : typography.fontFamily.regular,
                    },
                  ]}
                >
                  {labels[tab]}
                </Text>
                {active && (
                  <View style={[styles.tabIndicator, { backgroundColor: accentColor }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Content ── */}
        {activeTab === 'player' && (
          <ScrollView
            contentContainerStyle={styles.playerContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Kapak */}
            <View style={styles.coverWrapper}>
              <View style={[styles.coverGlow, { shadowColor: accentColor }]} />
              <Animated.View
                style={[
                  styles.coverContainer,
                  { transform: [{ scale: coverScale }] },
                ]}
              >
                <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
              </Animated.View>
            </View>

            {/* Kitap Bilgisi */}
            <View style={styles.bookInfo}>
              <View style={styles.bookInfoText}>
                <Text style={[styles.bookTitle, { color: isDark ? '#fff' : '#111' }]} numberOfLines={1}>
                  {currentChapter?.title || book.title}
                </Text>
                <Text style={[styles.bookAuthor, { color: isDark ? '#9ca3af' : '#637588' }]}>
                  {book.author}
                  {book.narrator ? ` · ${book.narrator}` : ''}
                </Text>
              </View>
              <View style={[styles.chapterBadge, { backgroundColor: isDark ? '#1e3a5f' : '#dbeafe' }]}>
                <Text style={[styles.chapterBadgeText, { color: accentColor }]}>
                  {chapterIndex + 1}/{totalChapters}
                </Text>
              </View>
            </View>

            {/* Seek Bar */}
            <View style={styles.seekSection}>
              <SeekBar
                progress={progress}
                height={6}
                showThumb
                onSeek={(p) => seek((p / 100) * playerState.duration)}
              />
              <View style={styles.timeRow}>
                <Text style={[styles.timeText, { color: isDark ? '#9ca3af' : '#637588' }]}>
                  {formatTime(playerState.position)}
                </Text>
                <Text style={[styles.timeText, { color: isDark ? '#6b7280' : '#9ca3af' }]}>
                  -{formatTime(remaining)}
                </Text>
              </View>
            </View>

            {/* Kontroller */}
            <AudioControls
              isPlaying={playerState.isPlaying}
              onPlayPause={handlePlayPause}
              onRewind={() => seek(Math.max(0, playerState.position - 15))}
              onForward={() => seek(Math.min(playerState.duration, playerState.position + 30))}
              onPrevChapter={previousChapter}
              onNextChapter={nextChapter}
              playbackRate={playerState.playbackRate}
              onSpeedChange={handleSpeedChange}
              volume={playerState.volume}
              isMuted={playerState.isMuted}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
              hasPrev={chapterIndex > 0}
              hasNext={chapterIndex < totalChapters - 1}
            />
          </ScrollView>
        )}

        {activeTab === 'chapters' && (
          <FlatList
            data={book.chapters ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const isActive = item.id === currentChapter?.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.chapterItem,
                    {
                      backgroundColor: isActive
                        ? isDark ? '#1e3a5f' : '#dbeafe'
                        : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      borderColor: isActive ? accentColor : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    play(book, item);
                    setActiveTab('player');
                  }}
                >
                  <View
                    style={[
                      styles.chapterNum,
                      { backgroundColor: isActive ? accentColor : isDark ? '#1e3a5f' : '#e0f0ff' },
                    ]}
                  >
                    {isActive && playerState.isPlaying ? (
                      <Ionicons name="volume-high" size={14} color="#fff" />
                    ) : (
                      <Text
                        style={[
                          styles.chapterNumText,
                          { color: isActive ? '#fff' : isDark ? '#9ca3af' : '#637588' },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <View style={styles.chapterItemInfo}>
                    <Text
                      style={[
                        styles.chapterItemTitle,
                        { color: isActive ? accentColor : isDark ? '#fff' : '#111' },
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={[styles.chapterItemDuration, { color: isDark ? '#6b7280' : '#9ca3af' }]}>
                      {item.duration}
                    </Text>
                  </View>
                  {isActive && (
                    <Ionicons name="musical-notes" size={18} color={accentColor} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}

        {activeTab === 'transcript' && (
          <ScrollView
            contentContainerStyle={styles.transcriptContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.transcriptCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <View style={styles.transcriptHeader}>
                <Ionicons name="document-text-outline" size={20} color={accentColor} />
                <Text style={[styles.transcriptChapterTitle, { color: isDark ? '#fff' : '#111' }]}>
                  {currentChapter?.title || 'Bölüm'}
                </Text>
              </View>
              <Text style={[styles.transcriptText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                {/* Gerçek transkript backend'den gelecek; şimdilik örnek metin */}
                {`Bu bölümün transkripti backend'den yüklenecek.\n\nŞu an dinlediğiniz: "${currentChapter?.title || book.title}"\n\nYazar: ${book.author}\n\nTranskript özelliği için backend'deki kitap verilerinde transcript alanının dolu olması gerekir. Seed scriptini çalıştırdıktan sonra bu alan gerçek içerikle dolacaktır.\n\n${book.description ?? ''}`}
              </Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* ── Uyku Modu Modal ── */}
      <Modal
        visible={sleepModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSleepModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSleepModalVisible(false)}
        >
          <View
            style={[styles.modalSheet, { backgroundColor: isDark ? '#1c2a3a' : '#fff' }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]} />
            <View style={styles.modalHeaderRow}>
              <Ionicons name="moon" size={22} color={accentColor} />
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#111' }]}>
                Uyku Zamanlayıcısı
              </Text>
            </View>
            <Text style={[styles.modalSubtitle, { color: isDark ? '#9ca3af' : '#637588' }]}>
              Seçilen süre sonunda oynatma durur
            </Text>

            <View style={styles.timerGrid}>
              {[5, 10, 15, 30, 45, 60, 90, 120].map((min) => {
                const active = playerState.sleepTimerMinutes === min;
                return (
                  <TouchableOpacity
                    key={min}
                    style={[
                      styles.timerChip,
                      {
                        backgroundColor: active ? accentColor : isDark ? '#1e3a5f' : '#e8f4fd',
                        borderColor: active ? accentColor : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      active ? clearSleepTimer() : setSleepTimer(min);
                      setSleepModalVisible(false);
                    }}
                  >
                    <Text style={[styles.timerChipText, { color: active ? '#fff' : isDark ? '#9ca3af' : '#374151' }]}>
                      {min < 60 ? `${min} dk` : `${min / 60} sa`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {playerState.sleepTimerMinutes && (
              <TouchableOpacity
                style={[styles.cancelTimer, { borderColor: '#ef4444' }]}
                onPress={() => {
                  clearSleepTimer();
                  setSleepModalVisible(false);
                }}
              >
                <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
                <Text style={[styles.cancelTimerText, { color: '#ef4444' }]}>
                  Zamanlayıcıyı İptal Et
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm },
  headerLabel: { fontSize: 10, letterSpacing: 1.5, fontFamily: typography.fontFamily.bold },
  headerTitle: { fontSize: typography.fontSize.base, fontFamily: typography.fontFamily.bold, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sleepBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  sleepBadgeText: { fontSize: 11, fontFamily: typography.fontFamily.bold, color: '#fff' },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: spacing.base,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, position: 'relative' },
  tabLabel: { fontSize: typography.fontSize.sm },
  tabIndicator: { position: 'absolute', bottom: 0, height: 2, width: '60%', borderRadius: 2 },

  // Player
  playerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  coverWrapper: { alignItems: 'center', marginBottom: spacing.xl },
  coverGlow: {
    position: 'absolute',
    width: COVER_SIZE * 0.8,
    height: COVER_SIZE * 0.8,
    borderRadius: COVER_SIZE * 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 0,
  },
  coverContainer: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.base,
  },
  bookInfoText: { flex: 1 },
  bookTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  bookAuthor: { fontSize: typography.fontSize.base, fontFamily: typography.fontFamily.regular },
  chapterBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  chapterBadgeText: { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.bold },

  seekSection: { marginBottom: spacing.xl, gap: spacing.sm },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.medium },

  // Chapters
  listContent: { padding: spacing.base, gap: spacing.sm },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    gap: spacing.base,
  },
  chapterNum: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  chapterNumText: { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.bold },
  chapterItemInfo: { flex: 1 },
  chapterItemTitle: { fontSize: typography.fontSize.base, fontFamily: typography.fontFamily.semiBold },
  chapterItemDuration: { fontSize: typography.fontSize.sm, marginTop: 2 },

  // Transcript
  transcriptContent: { padding: spacing.base },
  transcriptCard: { borderRadius: borderRadius['2xl'], padding: spacing.xl, gap: spacing.base },
  transcriptHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  transcriptChapterTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.bold },
  transcriptText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    lineHeight: typography.fontSize.base * 1.8,
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.base,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.sm },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  modalTitle: { fontSize: typography.fontSize.xl, fontFamily: typography.fontFamily.bold },
  modalSubtitle: { fontSize: typography.fontSize.sm, marginBottom: spacing.sm },
  timerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timerChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    minWidth: '22%',
    alignItems: 'center',
  },
  timerChipText: { fontSize: typography.fontSize.base, fontFamily: typography.fontFamily.semiBold },
  cancelTimer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, padding: spacing.base,
    borderRadius: borderRadius.xl, borderWidth: 1.5, marginTop: spacing.sm,
  },
  cancelTimerText: { fontSize: typography.fontSize.base, fontFamily: typography.fontFamily.semiBold },
});

export default AudioPlayerScreen;
