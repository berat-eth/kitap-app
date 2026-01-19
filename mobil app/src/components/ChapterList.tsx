import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { Chapter } from '../types';

interface ChapterListProps {
  chapters: Chapter[];
  currentChapterId?: string;
  onSelectChapter: (chapter: Chapter) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentChapterId,
  onSelectChapter,
}) => {
  const { theme } = useTheme();

  return (
    <FlatList
      data={chapters}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isActive = item.id === currentChapterId;
        return (
          <TouchableOpacity
            style={[
              styles.chapterItem,
              {
                backgroundColor: isActive ? `${theme.colors.primary}20` : theme.colors.surface,
                borderLeftColor: isActive ? theme.colors.primary : 'transparent',
              },
            ]}
            onPress={() => onSelectChapter(item)}
          >
            <View style={styles.chapterInfo}>
              <Text style={[styles.chapterTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.chapterDuration, { color: theme.colors.textSecondary }]}>
                {item.duration}
              </Text>
            </View>
            {isActive && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: spacing.base,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.xs,
  },
  chapterDuration: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
});

export default ChapterList;

