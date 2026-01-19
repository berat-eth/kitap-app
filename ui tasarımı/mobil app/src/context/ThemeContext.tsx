import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import { Theme, ThemeMode } from '../types';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
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

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    setThemeModeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme: Theme = {
    mode: themeMode,
    colors: {
      primary: colors.primary,
      background: themeMode === 'dark' ? colors.backgroundDark : colors.backgroundLight,
      surface: themeMode === 'dark' ? colors.surfaceDark : colors.surfaceLight,
      text: themeMode === 'dark' ? colors.textDark : colors.textLight,
      textSecondary: themeMode === 'dark' ? colors.textSecondaryDark : colors.textSecondaryLight,
      border: themeMode === 'dark' ? colors.borderDark : colors.borderLight,
      error: colors.error,
      success: colors.success,
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

