import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import BookCard from '../components/BookCard';
import ProgressBar from '../components/ProgressBar';
import { mockBooks } from '../utils/mockData';
import { useAudioPlayer } from '../context/AudioPlayerContext';

type LibraryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const LibraryScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const { play } = useAudioPlayer();
  const [activeTab, setActiveTab] = useState<'all' | 'downloaded'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const myBooks = mockBooks.filter((b) => b.isDownloaded || b.progress !== undefined);
  const downloadedBooks = mockBooks.filter((b) => b.isDownloaded);
  const displayedBooks = activeTab === 'all' ? myBooks : downloadedBooks;

  const recentlyPlayed = myBooks
    .filter((b) => b.lastPlayedAt)
    .sort((a, b) => (b.lastPlayedAt?.getTime() || 0) - (a.lastPlayedAt?.getTime() || 0))[0];

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const handlePlay = (book: typeof mockBooks[0]) => {
    play(book);
    navigation.navigate('AudioPlayer', { bookId: book.id });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity>
            <Text style={[styles.editButton, { color: theme.colors.primary }]}>Düzenle</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Kitaplığım</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={[styles.tabSwitcher, { backgroundColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'all' && { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'all' ? theme.colors.primary : theme.colors.textSecondary,
                  fontFamily:
                    activeTab === 'all'
                      ? typography.fontFamily.semiBold
                      : typography.fontFamily.medium,
                },
              ]}
            >
              Tüm Kitaplar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'downloaded' && { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => setActiveTab('downloaded')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'downloaded' ? theme.colors.primary : theme.colors.textSecondary,
                  fontFamily:
                    activeTab === 'downloaded'
                      ? typography.fontFamily.semiBold
                      : typography.fontFamily.medium,
                },
              ]}
            >
              İndirilenler
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentlyPlayed && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Son Dinlenenler
              </Text>
            </View>
            <View style={[styles.recentCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.recentCardContent}>
                <Image
                  source={{ uri: recentlyPlayed.coverImage }}
                  style={styles.recentCover}
                />
                <View style={styles.recentInfo}>
                  <View style={styles.recentHeader}>
                    <View style={styles.recentTitleSection}>
                      <Text style={[styles.recentTitle, { color: theme.colors.text }]}>
                        {recentlyPlayed.title}
                      </Text>
                      <Text style={[styles.recentAuthor, { color: theme.colors.textSecondary }]}>
                        {recentlyPlayed.author}
                      </Text>
                    </View>
                    {recentlyPlayed.isDownloaded && (
                      <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                    )}
                  </View>
                  {recentlyPlayed.progress !== undefined && (
                    <View style={styles.recentProgress}>
                      <View style={styles.recentProgressLabels}>
                        <Text style={[styles.progressTime, { color: theme.colors.textSecondary }]}>
                          04:15:30
                        </Text>
                        <Text style={[styles.progressTime, { color: theme.colors.textSecondary }]}>
                          12:45:00
                        </Text>
                      </View>
                      <ProgressBar progress={recentlyPlayed.progress} height={8} />
                    </View>
                  )}
                  <View style={styles.recentActions}>
                    <TouchableOpacity
                      style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => handlePlay(recentlyPlayed)}
                    >
                      <Ionicons name="play" size={20} color="#fff" />
                      <Text style={styles.continueButtonText}>Devam Et</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.moreButton, { borderColor: theme.colors.border }]}
                    >
                      <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kitap Listesi</Text>
            <View style={[styles.viewModeSwitcher, { backgroundColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.viewModeButton,
                  viewMode === 'list' && { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => setViewMode('list')}
              >
                <Ionicons
                  name="list"
                  size={20}
                  color={viewMode === 'list' ? theme.colors.primary : theme.colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewModeButton,
                  viewMode === 'grid' && { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => setViewMode('grid')}
              >
                <Ionicons
                  name="grid"
                  size={20}
                  color={viewMode === 'grid' ? theme.colors.primary : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
          {displayedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              variant="horizontal"
              showProgress={true}
              onPress={() => handleBookPress(book.id)}
              onPlay={() => handlePlay(book)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  editButton: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    padding: spacing.xs,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  tabText: {
    fontSize: typography.fontSize.sm,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  section: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
  },
  recentCard: {
    padding: spacing.base,
    borderRadius: borderRadius['2xl'],
    marginBottom: spacing.base,
  },
  recentCardContent: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  recentCover: {
    width: 128,
    aspectRatio: 2 / 3,
    borderRadius: borderRadius.xl,
  },
  recentInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recentTitleSection: {
    flex: 1,
  },
  recentTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  recentAuthor: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  recentProgress: {
    marginVertical: spacing.base,
  },
  recentProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  recentActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 40,
    borderRadius: borderRadius.lg,
  },
  continueButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: '#fff',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeSwitcher: {
    flexDirection: 'row',
    padding: spacing.xs,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  viewModeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.base,
  },
});

export default LibraryScreen;

