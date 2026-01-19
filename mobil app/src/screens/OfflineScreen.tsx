import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import ProgressBar from '../components/ProgressBar';
import { mockBooks } from '../utils/mockData';
import { useAudioPlayer } from '../context/AudioPlayerContext';

type OfflineScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Offline'>;

const OfflineScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<OfflineScreenNavigationProp>();
  const { play, playerState } = useAudioPlayer();
  const downloadedBooks = mockBooks.filter((b) => b.isDownloaded);

  const storageUsed = 65; // percentage
  const totalStorage = 128; // GB
  const remainingHours = 14;

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const handlePlay = (book: typeof mockBooks[0]) => {
    play(book);
    navigation.navigate('AudioPlayer', { bookId: book.id });
  };

  const currentBook = playerState.currentBook;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.storageSection}>
          <View style={[styles.storageCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.storageHeader}>
              <View>
                <Text style={[styles.storageTitle, { color: theme.colors.text }]}>
                  Cihaz Depolama Alanı
                </Text>
                <Text style={[styles.storageSubtitle, { color: theme.colors.textSecondary }]}>
                  Toplam {totalStorage} GB
                </Text>
              </View>
              <Text style={[styles.storagePercentage, { color: theme.colors.primary }]}>
                %{storageUsed}
              </Text>
            </View>
            <ProgressBar progress={storageUsed} height={12} />
            <Text style={[styles.storageInfo, { color: theme.colors.textSecondary }]}>
              Çevrimdışı dinleme için yaklaşık{' '}
              <Text style={{ color: theme.colors.text, fontFamily: typography.fontFamily.medium }}>
                {remainingHours} saat
              </Text>{' '}
              daha yeriniz var.
            </Text>
          </View>
        </View>

        <View style={styles.booksSection}>
          {downloadedBooks.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={[styles.bookItem, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleBookPress(book.id)}
            >
              <View style={styles.bookImageContainer}>
                <Image source={{ uri: book.coverImage }} style={styles.bookImage} />
                <View style={[styles.downloadBadge, { backgroundColor: theme.colors.success }]}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              </View>
              <View style={styles.bookInfo}>
                <Text style={[styles.bookTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  {book.title}
                </Text>
                <Text
                  style={[styles.bookAuthor, { color: theme.colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {book.author}
                </Text>
                <View style={styles.bookMeta}>
                  <View style={[styles.metaBadge, { backgroundColor: theme.colors.border }]}>
                    <Text style={[styles.metaText, { color: theme.colors.text }]}>
                      {book.duration}
                    </Text>
                  </View>
                  <Text style={[styles.metaCategory, { color: theme.colors.textSecondary }]}>
                    • {book.category}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => {
                  // Show options menu
                }}
              >
                <Ionicons name="ellipsis-vertical" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {currentBook && (
        <View
          style={[
            styles.miniPlayer,
            {
              backgroundColor: theme.colors.primary,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <Image source={{ uri: currentBook.coverImage }} style={styles.miniPlayerImage} />
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>
              {currentBook.title}
            </Text>
            <Text style={styles.miniPlayerSubtitle} numberOfLines={1}>
              {playerState.currentChapter?.title || 'Bölüm 1'} • Kaldığınız yerden devam
            </Text>
          </View>
          <TouchableOpacity
            style={styles.miniPlayerButton}
            onPress={() => {
              if (playerState.isPlaying) {
                navigation.navigate('AudioPlayer', { bookId: currentBook.id });
              } else {
                handlePlay(currentBook);
              }
            }}
          >
            <Ionicons name="play" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  storageSection: {
    padding: spacing.lg,
  },
  storageCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  storageTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
  },
  storageSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    marginTop: spacing.xs,
  },
  storagePercentage: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  storageInfo: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    marginTop: spacing.xs,
  },
  booksSection: {
    paddingHorizontal: spacing.base,
    gap: spacing.base,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    gap: spacing.base,
  },
  bookImageContainer: {
    position: 'relative',
  },
  bookImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
  },
  downloadBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bookInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  bookTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  bookAuthor: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  metaCategory: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  moreButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    paddingBottom: spacing['2xl'],
    gap: spacing.base,
    borderTopWidth: 1,
  },
  miniPlayerImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
  },
  miniPlayerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  miniPlayerTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: '#fff',
  },
  miniPlayerSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  miniPlayerButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OfflineScreen;

