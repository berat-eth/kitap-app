import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import { mockBooks } from '../utils/mockData';
import { useAudioPlayer } from '../context/AudioPlayerContext';

type BookDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BookDetail'>;

const BookDetailScreen = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<BookDetailScreenNavigationProp>();
  const { play } = useAudioPlayer();
  const { bookId } = route.params as { bookId: string };
  const book = mockBooks.find((b) => b.id === bookId);

  if (!book) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
        <Text style={{ color: theme.colors.text }}>Kitap bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const handlePlay = () => {
    play(book);
    navigation.navigate('AudioPlayer', { bookId: book.id });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.coverSection}>
          <View style={[styles.glow, { backgroundColor: `${theme.colors.primary}33` }]} />
          <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
        </View>

        <View style={styles.metadataSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{book.title}</Text>
          <Text style={[styles.author, { color: theme.colors.primary }]}>{book.author}</Text>
          {book.narrator && (
            <Text style={[styles.narrator, { color: theme.colors.textSecondary }]}>
              Seslendiren: <Text style={{ color: theme.colors.text }}>{book.narrator}</Text>
            </Text>
          )}

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="time-outline" size={18} color={theme.colors.text} />
              <Text style={[styles.badgeText, { color: theme.colors.text }]}>
                {book.duration}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="library-outline" size={18} color={theme.colors.text} />
              <Text style={[styles.badgeText, { color: theme.colors.text }]}>
                {book.category}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="star" size={18} color="#fbbf24" />
              <Text style={[styles.badgeText, { color: theme.colors.text }]}>{book.rating}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="bookmark-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Kitaplığa Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="download-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                İndir (450 MB)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {book.description && (
          <View style={styles.descriptionSection}>
            <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>Hakkında</Text>
            <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
              {book.description}
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.previewButton, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="headset-outline" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlePlay}
        >
          <Ionicons name="play" size={28} color="#fff" />
          <Text style={styles.playButtonText}>Hemen Dinle</Text>
        </TouchableOpacity>
      </View>
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
  coverSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 192,
    height: 256,
    borderRadius: borderRadius.full,
    opacity: 0.2,
    top: spacing['2xl'],
  },
  coverImage: {
    width: 192,
    aspectRatio: 2 / 3,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  metadataSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    lineHeight: typography.fontSize['4xl'] * typography.lineHeight.tight,
  },
  author: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.semiBold,
  },
  narrator: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.base,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.base,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.base,
    width: '100%',
    marginTop: spacing.base,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
    borderRadius: borderRadius['2xl'],
    gap: spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  descriptionSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing['2xl'],
  },
  descriptionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: typography.fontSize.base + 3,
    fontFamily: typography.fontFamily.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.base,
    paddingBottom: spacing['2xl'],
    borderTopWidth: 1,
  },
  previewButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: borderRadius.xl,
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#fff',
  },
});

export default BookDetailScreen;

