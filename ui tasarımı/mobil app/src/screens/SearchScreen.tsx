import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius } from '../theme';
import { RootStackParamList } from '../navigation/types';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import BookCard from '../components/BookCard';
import { mockBooks, mockCategories } from '../utils/mockData';
import { useAudioPlayer } from '../context/AudioPlayerContext';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SearchScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { play } = useAudioPlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [recentSearches] = useState(['Suç ve Ceza', 'Stefan Zweig', 'Harry Potter Sesli Betimleme']);

  const filteredBooks = mockBooks.filter((book) => {
    if (searchQuery) {
      return (
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const handlePlay = (book: typeof mockBooks[0]) => {
    play(book);
    navigation.navigate('AudioPlayer', { bookId: book.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Arama</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchSection}>
          <SearchBar
            placeholder="Kitap, yazar veya tür ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Popüler Kategoriler
          </Text>
          <CategoryFilter
            categories={mockCategories.slice(1)}
            selectedCategoryId={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {searchQuery === '' && (
          <View style={styles.recentSearchesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Son Aramalar</Text>
              <TouchableOpacity>
                <Text style={[styles.clearText, { color: theme.colors.primary }]}>Temizle</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.searchItem, { borderBottomColor: theme.colors.border }]}
              >
                <View style={[styles.searchIcon, { backgroundColor: theme.colors.surface }]}>
                  <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
                </View>
                <Text style={[styles.searchText, { color: theme.colors.text }]}>{search}</Text>
                <TouchableOpacity>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.resultsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {searchQuery ? 'Arama Sonuçları' : 'Önerilen Kitaplar'}
          </Text>
          {filteredBooks.slice(0, 3).map((book) => (
            <BookCard
              key={book.id}
              book={book}
              variant="horizontal"
              onPress={() => handleBookPress(book.id)}
              onPlay={() => handlePlay(book)}
            />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          // Voice search functionality
        }}
      >
        <Ionicons name="mic" size={32} color="#fff" />
      </TouchableOpacity>
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
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  searchSection: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  categoriesSection: {
    marginTop: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  clearText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  recentSearchesSection: {
    marginTop: spacing.base,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.base,
  },
  searchIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
  },
  resultsSection: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
  },
  fab: {
    position: 'absolute',
    bottom: spacing['2xl'],
    right: spacing['2xl'],
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default SearchScreen;

