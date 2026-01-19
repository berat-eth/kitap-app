import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing } from '../theme';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import BookCard from '../components/BookCard';
import { mockBooks, mockCategories, featuredBook, popularBooks } from '../utils/mockData';
import { useAudioPlayer } from '../context/AudioPlayerContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { play } = useAudioPlayer();
  const [selectedCategory, setSelectedCategory] = useState('1');

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const handlePlay = (book: typeof mockBooks[0]) => {
    play(book);
    navigation.navigate('AudioPlayer', { bookId: book.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        user={{
          name: 'Ahmet Yılmaz',
          avatar: 'https://i.pravatar.cc/150?img=12',
        }}
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SearchBar
          placeholder="Kitap veya yazar ara..."
          onVoiceSearch={() => navigation.navigate('Search')}
        />

        <CategoryFilter
          categories={mockCategories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Sizin İçin Önerilenler
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <BookCard
            book={featuredBook}
            variant="featured"
            onPress={() => handleBookPress(featuredBook.id)}
            onPlay={() => handlePlay(featuredBook)}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Çok Dinlenenler</Text>
          {popularBooks.map((book) => (
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
    </View>
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
});

export default HomeScreen;

