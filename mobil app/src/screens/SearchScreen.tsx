import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import BookCard from '../components/BookCard';
import { searchBooks, getCategories, getBooks } from '../services/bookService';
import { Book, Category } from '../types';

const MINI_PLAYER_HEIGHT = 60;

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SearchScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { play, playerState } = useAudioPlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches] = useState<string[]>([]);

  const hasActivePlayer = playerState.currentBook && playerState.currentChapter;

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const results = await searchBooks(searchQuery.trim());
        setBooks(results);
      } else {
        const { books: b } = await getBooks({
          limit: 20,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
        });
        setBooks(b);
      }
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    getCategories().then((c) => setCategories(c.slice(1)));
  }, []);

  useEffect(() => {
    const t = setTimeout(loadBooks, searchQuery ? 400 : 0);
    return () => clearTimeout(t);
  }, [loadBooks, searchQuery]);

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const handlePlay = (book: Book) => {
    play(book);
    navigation.navigate('AudioPlayer', { bookId: book.id });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Arama</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          hasActivePlayer && { paddingBottom: spacing['4xl'] + MINI_PLAYER_HEIGHT }
        ]}
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
            categories={categories}
            selectedCategoryId={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {searchQuery === '' && recentSearches.length > 0 && (
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
                  <Ionicons name="time-outline" size={20} color={theme.colors.text} />
                </View>
                <Text style={[styles.searchText, { color: theme.colors.text }]}>{search}</Text>
                <TouchableOpacity>
                  <Ionicons name="close" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.resultsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {searchQuery ? 'Arama Sonuçları' : 'Önerilen Kitaplar'}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : books.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'Sonuç bulunamadı' : 'Henüz kitap yok'}
            </Text>
          ) : (
            <>
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  variant="horizontal"
                  onPress={() => handleBookPress(book.id)}
                  onPlay={() => handlePlay(book)}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.fab, 
          { backgroundColor: theme.colors.primary },
          hasActivePlayer && { bottom: spacing['2xl'] + MINI_PLAYER_HEIGHT }
        ]}
        onPress={() => {
          // Voice search functionality
        }}
      >
        <Ionicons name="mic" size={32} color="#fff" />
      </TouchableOpacity>
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
  emptyText: {
    fontSize: typography.fontSize.base,
    paddingVertical: spacing.lg,
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

