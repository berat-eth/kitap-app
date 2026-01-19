import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import { Theme, ThemeMode } from '../types';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  highContrast: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    (systemColorScheme === 'dark' ? 'dark' : 'light')
  );
  const [highContrast, setHighContrast] = useState(false);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    setThemeModeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const getThemeColors = () => {
    if (highContrast) {
      // High contrast colors - maximum contrast
      // Icons should always be visible, so textSecondary should be same as text
      // Surface should have enough contrast with text/icons
      return {
        primary: themeMode === 'dark' ? '#60a5fa' : '#2563eb', // Brighter blue
        background: themeMode === 'dark' ? '#000000' : '#ffffff',
        surface: themeMode === 'dark' ? '#000000' : '#ffffff', // Same as background for maximum contrast
        text: themeMode === 'dark' ? '#ffffff' : '#000000',
        textSecondary: themeMode === 'dark' ? '#ffffff' : '#000000', // Same as text for maximum visibility
        border: themeMode === 'dark' ? '#ffffff' : '#000000', // High contrast borders (2px recommended)
        error: '#ff0000',
        success: '#00ff00',
      };
    }

    // Normal colors
    return {
      primary: colors.primary,
      background: themeMode === 'dark' ? colors.backgroundDark : colors.backgroundLight,
      surface: themeMode === 'dark' ? colors.surfaceDark : colors.surfaceLight,
      text: themeMode === 'dark' ? colors.textDark : colors.textLight,
      textSecondary: themeMode === 'dark' ? colors.textSecondaryDark : colors.textSecondaryLight,
      border: themeMode === 'dark' ? colors.borderDark : colors.borderLight,
      error: colors.error,
      success: colors.success,
    };
  };

  const theme: Theme = {
    mode: themeMode,
    colors: getThemeColors(),
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, highContrast, toggleTheme, setThemeMode, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};

