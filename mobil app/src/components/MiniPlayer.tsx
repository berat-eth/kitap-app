import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MiniPlayer: React.FC = () => {
  const { theme } = useTheme();
  const { playerState, pause, resume, previousChapter, nextChapter } = useAudioPlayer();
  const navigation = useNavigation<NavigationProp>();

  const { currentBook, currentChapter, isPlaying, position, duration } = playerState;

  if (!currentBook || !currentChapter) {
    return null;
  }

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  
  const chapters = currentBook.chapters || [];
  const currentIndex = chapters.findIndex(c => c.id === currentChapter.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePress = () => {
    navigation.navigate('AudioPlayer', { 
      bookId: currentBook.id, 
      chapterId: currentChapter?.id 
    });
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await resume();
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      previousChapter();
    }
  };

  const handleNext = () => {
    if (hasNext) {
      nextChapter();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Progress Bar at top */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: theme.colors.primary,
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Cover Image */}
        <Image
          source={{ uri: currentBook.coverImage }}
          style={styles.coverImage}
        />

        {/* Book Info */}
        <View style={styles.infoContainer}>
          <Text
            style={[styles.title, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {currentBook.title}
          </Text>
          <Text
            style={[styles.chapter, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {currentChapter.title}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Previous Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handlePrevious}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={!hasPrevious}
          >
            <Ionicons
              name="play-skip-back"
              size={20}
              color={hasPrevious ? theme.colors.text : theme.colors.border}
            />
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
            onPress={handlePlayPause}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={18}
              color="#fff"
              style={isPlaying ? undefined : { marginLeft: 2 }}
            />
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleNext}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={!hasNext}
          >
            <Ionicons
              name="play-skip-forward"
              size={20}
              color={hasNext ? theme.colors.text : theme.colors.border}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    overflow: 'hidden',
  },
  progressContainer: {
    height: 3,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  coverImage: {
    width: 42,
    height: 42,
    borderRadius: 6,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  chapter: {
    fontSize: 11,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MiniPlayer;
