import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import BookCard from '../components/BookCard';
import { getFeaturedBooks, getPopularBooks, getCategories } from '../services/bookService';
import { Book, Category } from '../types';

const MINI_PLAYER_HEIGHT = 60;

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { play, playerState } = useAudioPlayer();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredBook, setFeaturedBook] = useState<Book | null>(null);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasActivePlayer = playerState.currentBook && playerState.currentChapter;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [cats, featured, popular] = await Promise.all([
          getCategories(),
          getFeaturedBooks(),
          getPopularBooks(),
        ]);
        setCategories(cats);
        setFeaturedBook(featured[0] ?? null);
        setPopularBooks(popular);
      } catch (err) {
        setError('Veriler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const handlePlay = (book: Book) => {
    play(book);
    navigation.navigate('AudioPlayer', { bookId: book.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Header
        rightAction={
          <TouchableOpacity onPress={() => {
            // Navigate to Settings tab (HomeScreen is inside MainTabs)
            (navigation as any).navigate('Settings');
          }}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          hasActivePlayer && { paddingBottom: spacing['4xl'] + MINI_PLAYER_HEIGHT }
        ]}
      >
        <SearchBar
          placeholder="Kitap veya yazar ara..."
          onVoiceSearch={() => navigation.navigate('MainTabs', { screen: 'Search' })}
        />

        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Sizin İçin Önerilenler
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Search' })}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          {featuredBook ? (
            <BookCard
              book={featuredBook}
              variant="featured"
              onPress={() => handleBookPress(featuredBook.id)}
              onPlay={() => handlePlay(featuredBook)}
            />
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Öne çıkan kitap bulunamadı</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Çok Dinlenenler</Text>
          {popularBooks.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Henüz kitap yok</Text>
          ) : (
            <>
              {popularBooks.map((book) => (
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
  },
  errorBox: {
    padding: spacing.base,
    marginHorizontal: spacing.base,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    paddingVertical: spacing.lg,
  },
});

export default HomeScreen;

