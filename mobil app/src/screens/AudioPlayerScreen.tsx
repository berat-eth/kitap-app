import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import { mockBooks } from '../utils/mockData';
import ProgressBar from '../components/ProgressBar';
import AudioControls from '../components/AudioControls';

type AudioPlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AudioPlayer'>;

const AudioPlayerScreen = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<AudioPlayerScreenNavigationProp>();
  const { playerState, play, pause, resume, seek, setPlaybackRate, setVolume, toggleMute, nextChapter, previousChapter, setSleepTimer, clearSleepTimer } = useAudioPlayer();
  const { bookId } = route.params as { bookId: string };
  const book = mockBooks.find((b) => b.id === bookId);
  const [sleepTimerModalVisible, setSleepTimerModalVisible] = useState(false);

  if (!book) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
        <Text style={{ color: theme.colors.text }}>Kitap bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const currentChapter = playerState.currentChapter || book.chapters?.[0];
  const progress = playerState.duration > 0 && !isNaN(playerState.duration) ? (playerState.position / playerState.duration) * 100 : 0;
  const remainingTime = Math.max(0, playerState.duration - playerState.position);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (playerState.isPlaying) {
      pause();
    } else {
      if (playerState.currentBook) {
        resume();
      } else {
        play(book, currentChapter);
      }
    }
  };

  const handleRewind = () => {
    seek(Math.max(0, playerState.position - 15));
  };

  const handleForward = () => {
    seek(Math.min(playerState.duration, playerState.position + 30));
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
    const currentIndex = speeds.findIndex((s) => Math.abs(s - playerState.playbackRate) < 0.1);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {currentChapter?.title || book.title}
        </Text>
        <View style={styles.headerRight}>
          {playerState.sleepTimerMinutes && (
            <View style={[styles.sleepTimerBadge, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="moon" size={16} color="#fff" />
              <Text style={styles.sleepTimerText}>{playerState.sleepTimerMinutes}dk</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.sleepButton}
            onPress={() => setSleepTimerModalVisible(true)}
          >
            <Ionicons name="moon-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Ionicons name="bookmark-outline" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverContainer}>
          <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.chapterTitle, { color: theme.colors.text }]}>
            {currentChapter?.title || 'Bölüm 1'}
          </Text>
          <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
            {book.author}
          </Text>
        </View>

        <View style={styles.progressSection}>
          <ProgressBar
            progress={progress}
            height={16}
            showThumb={true}
            onSeek={(p) => seek((p / 100) * playerState.duration)}
          />
          <View style={styles.timeLabels}>
            <Text style={[styles.timeText, { color: theme.colors.text }]}>
              {formatTime(playerState.position)}
            </Text>
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              -{formatTime(remainingTime)}
            </Text>
          </View>
        </View>

        <AudioControls
          isPlaying={playerState.isPlaying}
          onPlayPause={handlePlayPause}
          onRewind={handleRewind}
          onForward={handleForward}
          playbackRate={playerState.playbackRate}
          onSpeedChange={handleSpeedChange}
          volume={playerState.volume}
          isMuted={playerState.isMuted}
          onVolumeChange={setVolume}
          onToggleMute={toggleMute}
        />
      </ScrollView>

      {/* Sleep Timer Modal */}
      <Modal
        visible={sleepTimerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSleepTimerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Uyku Modu</Text>
              <TouchableOpacity onPress={() => setSleepTimerModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.sleepTimerOptions}>
              {[5, 10, 15, 30, 45, 60, 90, 120].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.sleepTimerOption,
                    {
                      backgroundColor: playerState.sleepTimerMinutes === minutes ? theme.colors.primary : theme.colors.background,
                      borderColor: playerState.sleepTimerMinutes === minutes ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => {
                    if (playerState.sleepTimerMinutes === minutes) {
                      clearSleepTimer();
                    } else {
                      setSleepTimer(minutes);
                    }
                    setSleepTimerModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sleepTimerOptionText,
                      {
                        color: playerState.sleepTimerMinutes === minutes ? '#fff' : theme.colors.text,
                      },
                    ]}
                  >
                    {minutes} dakika
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: theme.colors.error + '20' }]}
              onPress={() => {
                clearSleepTimer();
                setSleepTimerModalVisible(false);
              }}
            >
              <Text style={[styles.clearButtonText, { color: theme.colors.error }]}>
                Uyku Modunu Kapat
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    paddingHorizontal: spacing.base,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sleepButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sleepTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  sleepTimerText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: '#fff',
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    gap: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
  },
  sleepTimerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
  },
  sleepTimerOption: {
    flex: 1,
    minWidth: '30%',
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
  },
  sleepTimerOptionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
  },
  clearButton: {
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing['4xl'],
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: spacing['2xl'],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  chapterTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    lineHeight: typography.fontSize['3xl'] * 1.2,
  },
  author: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: spacing['2xl'],
    gap: spacing.md,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    fontVariant: ['tabular-nums'],
  },
});

export default AudioPlayerScreen;

