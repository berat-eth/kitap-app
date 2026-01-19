import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius } from '../theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showThumb?: boolean;
  onSeek?: (progress: number) => void;
  disabled?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 4,
  showThumb = false,
  onSeek,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const handlePress = (event: any) => {
    if (disabled || !onSeek) return;
    const { locationX, target } = event.nativeEvent;
    const width = target?.clientWidth || 0;
    if (width > 0) {
      const newProgress = (locationX / width) * 100;
      onSeek(Math.max(0, Math.min(100, newProgress)));
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { height, backgroundColor: theme.colors.border }]}
      onPress={handlePress}
      disabled={disabled || !onSeek}
      activeOpacity={1}
    >
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress}%`,
            backgroundColor: theme.colors.primary,
            height,
          },
        ]}
      />
      {showThumb && (
        <View
          style={[
            styles.thumb,
            {
              left: `${clampedProgress}%`,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  progress: {
    borderRadius: borderRadius.full,
  },
  thumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    top: -12,
    marginLeft: -14,
  },
});

export default ProgressBar;

