import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius } from '../theme';

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRewind: () => void;
  onForward: () => void;
  playbackRate: number;
  onSpeedChange: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
  onRewind,
  onForward,
  playbackRate,
  onSpeedChange,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.mainControls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.colors.surface }]}
          onPress={onRewind}
        >
          <Ionicons name="play-back" size={36} color={theme.colors.text} />
          <Text style={[styles.controlLabel, { color: theme.colors.text }]}>15s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={onPlayPause}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={56}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.colors.surface }]}
          onPress={onForward}
        >
          <Ionicons name="play-forward" size={36} color={theme.colors.text} />
          <Text style={[styles.controlLabel, { color: theme.colors.text }]}>30s</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={[styles.speedButton, { backgroundColor: theme.colors.surface }]}
          onPress={onSpeedChange}
        >
          <Text style={[styles.speedText, { color: theme.colors.text }]}>
            {playbackRate.toFixed(1)}x Hız
          </Text>
        </TouchableOpacity>

        <View style={[styles.volumeContainer, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={onToggleMute}>
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <View style={[styles.volumeSlider, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.volumeFill,
                {
                  width: `${(isMuted ? 0 : volume) * 100}%`,
                  backgroundColor: theme.colors.textSecondary,
                },
              ]}
            />
          </View>
          <TouchableOpacity onPress={() => onVolumeChange(1)}>
            <Ionicons name="volume-high" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    marginTop: -spacing.xs,
  },
  playButton: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    paddingHorizontal: spacing.sm,
  },
  speedButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  speedText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  volumeSlider: {
    flex: 1,
    height: 6,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});

export default AudioControls;

