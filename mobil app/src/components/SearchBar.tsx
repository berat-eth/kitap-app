import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onVoiceSearch?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Kitap veya yazar ara...',
  onSearch,
  onVoiceSearch,
  value,
  onChangeText,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState(value || '');

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    onChangeText?.(text);
  };

  const handleClear = () => {
    setSearchQuery('');
    onChangeText?.('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="search" size={24} color={theme.colors.text} />
      </View>
      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={searchQuery}
        onChangeText={handleChangeText}
        onSubmitEditing={() => onSearch?.(searchQuery)}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      )}
      {onVoiceSearch && (
        <TouchableOpacity onPress={onVoiceSearch} style={styles.voiceButton}>
          <Ionicons name="mic" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    marginVertical: spacing.sm,
  },
  iconContainer: {
    paddingHorizontal: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  voiceButton: {
    padding: spacing.sm,
  },
});

export default SearchBar;

