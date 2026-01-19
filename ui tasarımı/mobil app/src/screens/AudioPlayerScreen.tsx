import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { typography, spacing, borderRadius } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { mockBooks } from '../utils/mockData';
import ProgressBar from '../components/ProgressBar';
import AudioControls from '../components/AudioControls';

type AudioPlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AudioPlayer'>;

const AudioPlayerScreen = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<AudioPlayerScreenNavigationProp>();
  const { playerState, play, pause, resume, seek, setPlaybackRate, setVolume, toggleMute, nextChapter, previousChapter } = useAudioPlayer();
  const { bookId } = route.params as { bookId: string };
  const book = mockBooks.find((b) => b.id === bookId);
  const [speedModalVisible, setSpeedModalVisible] = useState(false);

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Kitap bulunamadı</Text>
      </View>
    );
  }

  const currentChapter = playerState.currentChapter || book.chapters?.[0];
  const progress = playerState.duration > 0 ? (playerState.position / playerState.duration) * 100 : 0;
  const remainingTime = playerState.duration - playerState.position;

  const formatTime = (seconds: number) => {
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {currentChapter?.title || book.title}
        </Text>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={28} color={theme.colors.text} />
        </TouchableOpacity>
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

        <View style={styles.chapterNav}>
          <TouchableOpacity
            style={[styles.chapterButton, { backgroundColor: theme.colors.surface }]}
            onPress={previousChapter}
            disabled={!book.chapters || book.chapters.findIndex((ch) => ch.id === currentChapter?.id) === 0}
          >
            <Ionicons name="play-skip-back" size={18} color={theme.colors.text} />
            <Text style={[styles.chapterButtonText, { color: theme.colors.text }]}>Önceki</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chapterButton, { backgroundColor: theme.colors.surface }]}
            onPress={nextChapter}
            disabled={!book.chapters || book.chapters.findIndex((ch) => ch.id === currentChapter?.id) === (book.chapters.length - 1)}
          >
            <Text style={[styles.chapterButtonText, { color: theme.colors.text }]}>Sonraki</Text>
            <Ionicons name="play-skip-forward" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  bookmarkButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: spacing['2xl'],
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  chapterTitle: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
  author: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.regular,
  },
  progressSection: {
    marginBottom: spacing['2xl'],
    gap: spacing.sm,
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
  chapterNav: {
    flexDirection: 'row',
    gap: spacing.base,
    marginTop: spacing.base,
  },
  chapterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  chapterButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
});

export default AudioPlayerScreen;

