import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onPress?: () => void;
  onPlay?: () => void;
  variant?: 'horizontal' | 'vertical' | 'featured';
  showProgress?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onPress,
  onPlay,
  variant = 'horizontal',
  showProgress = false,
}) => {
  const { theme } = useTheme();

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={[styles.featuredContainer, { backgroundColor: theme.colors.surface }]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image source={{ uri: book.coverImage }} style={styles.featuredImage} />
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredContent}>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>GÜNÜN SEÇİMİ</Text>
            </View>
            <Text style={styles.featuredTitle}>{book.title}</Text>
            <Text style={styles.featuredAuthor}>{book.author}</Text>
            <View style={styles.featuredActions}>
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: theme.colors.surface }]}
                onPress={onPlay}
              >
                <Ionicons name="play" size={24} color={theme.colors.text} />
                <Text style={[styles.playButtonText, { color: theme.colors.text }]}>Dinle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookmarkButton}>
                <Ionicons name="bookmark-outline" size={24} color={theme.colors.surface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'vertical') {
    return (
      <TouchableOpacity
        style={[styles.verticalContainer, { backgroundColor: theme.colors.surface }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image source={{ uri: book.coverImage }} style={styles.verticalImage} />
        <Text style={[styles.verticalTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.verticalAuthor, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {book.author}
        </Text>
      </TouchableOpacity>
    );
  }

  // Horizontal variant (default)
  return (
    <TouchableOpacity
      style={[styles.horizontalContainer, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: book.coverImage }} style={styles.horizontalImage} />
      <View style={styles.horizontalContent}>
        <Text style={[styles.horizontalTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {book.title}
        </Text>
        <Text
          style={[styles.horizontalAuthor, { color: theme.colors.textSecondary }]}
          numberOfLines={1}
        >
          {book.author}
        </Text>
        <View style={styles.horizontalMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              {book.duration}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              {book.rating}
            </Text>
          </View>
        </View>
        {showProgress && book.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${book.progress}%`, backgroundColor: theme.colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              %{book.progress}
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={[styles.playIconButton, { backgroundColor: `${theme.colors.primary}20` }]}
        onPress={onPlay}
      >
        <Ionicons name="play" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featuredContainer: {
    width: '100%',
    height: 280,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    padding: spacing.base,
  },
  featuredContent: {
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
  },
  badgeText: {
    color: '#fff',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  featuredTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: '#fff',
  },
  featuredAuthor: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 48,
    borderRadius: borderRadius.xl,
  },
  playButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.base,
    marginVertical: spacing.sm,
  },
  horizontalImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
  },
  horizontalContent: {
    flex: 1,
    gap: spacing.xs,
  },
  horizontalTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
  },
  horizontalAuthor: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  horizontalMeta: {
    flexDirection: 'row',
    gap: spacing.base,
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    minWidth: 40,
  },
  playIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalContainer: {
    width: 120,
    marginRight: spacing.base,
  },
  verticalImage: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  verticalTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  verticalAuthor: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
});

export default BookCard;

