import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRewind: () => void;
  onForward: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  playbackRate: number;
  onSpeedChange: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
  onRewind,
  onForward,
  onPrevChapter,
  onNextChapter,
  playbackRate,
  onSpeedChange,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  hasPrev = true,
  hasNext = true,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const accentColor = '#137fec';

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const handlePlayPress = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true, friction: 5 }),
    ]).start();
    onPlayPause();
  };

  const volBarWidth = useRef(0);
  const volPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        if (volBarWidth.current > 0) {
          const x = e.nativeEvent.locationX;
          onVolumeChange(Math.max(0, Math.min(1, x / volBarWidth.current)));
        }
      },
      onPanResponderMove: (e) => {
        if (volBarWidth.current > 0) {
          const x = e.nativeEvent.locationX;
          onVolumeChange(Math.max(0, Math.min(1, x / volBarWidth.current)));
        }
      },
    }),
  ).current;

  const surfaceColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const textColor = isDark ? '#fff' : '#1a1a2e';
  const mutedColor = isDark ? '#6b7280' : '#9ca3af';

  const speedLabel = playbackRate === 1 ? '1x' : `${playbackRate.toFixed(1).replace('.0', '')}x`;

  return (
    <View style={styles.container}>
      {/* Ana Kontroller */}
      <View style={styles.mainRow}>
        {/* Önceki Bölüm */}
        <TouchableOpacity
          style={[styles.navBtn, !hasPrev && styles.disabled]}
          onPress={onPrevChapter}
          disabled={!hasPrev}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-back" size={28} color={hasPrev ? textColor : mutedColor} />
        </TouchableOpacity>

        {/* 15s Geri */}
        <TouchableOpacity style={styles.skipBtn} onPress={onRewind} activeOpacity={0.7}>
          <View style={styles.skipIconWrap}>
            <Ionicons name="play-back" size={32} color={textColor} />
          </View>
          <View style={styles.skipLabelWrap}>
            <Text style={[styles.skipLabel, { color: textColor }]}>15</Text>
          </View>
        </TouchableOpacity>

        {/* Play/Pause */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: accentColor }]}
            onPress={handlePlayPress}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color="#fff"
              style={!isPlaying ? { marginLeft: 5 } : undefined}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* 30s İleri */}
        <TouchableOpacity style={styles.skipBtn} onPress={onForward} activeOpacity={0.7}>
          <View style={styles.skipIconWrap}>
            <Ionicons name="play-forward" size={32} color={textColor} />
          </View>
          <View style={styles.skipLabelWrap}>
            <Text style={[styles.skipLabel, { color: textColor }]}>30</Text>
          </View>
        </TouchableOpacity>

        {/* Sonraki Bölüm */}
        <TouchableOpacity
          style={[styles.navBtn, !hasNext && styles.disabled]}
          onPress={onNextChapter}
          disabled={!hasNext}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-forward" size={28} color={hasNext ? textColor : mutedColor} />
        </TouchableOpacity>
      </View>

      {/* İkincil Kontroller */}
      <View style={styles.secondaryRow}>
        {/* Hız */}
        <TouchableOpacity
          style={[styles.speedChip, { backgroundColor: surfaceColor }]}
          onPress={onSpeedChange}
          activeOpacity={0.7}
        >
          <Ionicons name="speedometer-outline" size={16} color={accentColor} />
          <Text style={[styles.speedText, { color: textColor }]}>{speedLabel} Hız</Text>
        </TouchableOpacity>

        {/* Ses */}
        <View style={[styles.volumeRow, { backgroundColor: surfaceColor }]}>
          <TouchableOpacity onPress={onToggleMute} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={isMuted ? 'volume-mute' : volume < 0.3 ? 'volume-low' : volume < 0.7 ? 'volume-medium' : 'volume-high'}
              size={20}
              color={isMuted ? mutedColor : accentColor}
            />
          </TouchableOpacity>

          <View
            style={styles.volTrack}
            onLayout={(e) => { volBarWidth.current = e.nativeEvent.layout.width; }}
            {...volPan.panHandlers}
          >
            <View style={[styles.volFill, { width: `${(isMuted ? 0 : volume) * 100}%`, backgroundColor: accentColor }]} />
            <View
              style={[
                styles.volThumb,
                {
                  left: `${(isMuted ? 0 : volume) * 100}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </View>

          <Ionicons name="volume-high" size={20} color={mutedColor} />
        </View>
      </View>
    </View>
  );
};

const PLAY_SIZE = 72;

const styles = StyleSheet.create({
  container: {
    gap: spacing['2xl'],
    paddingTop: spacing.base,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },

  navBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: { opacity: 0.35 },

  skipBtn: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipIconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipLabelWrap: {
    position: 'absolute',
    bottom: 4,
    width: '100%',
    alignItems: 'center',
  },
  skipLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
  },

  playBtn: {
    width: PLAY_SIZE,
    height: PLAY_SIZE,
    borderRadius: PLAY_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  speedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.xl,
  },
  speedText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },

  volumeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.xl,
  },
  volTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(150,150,150,0.2)',
    position: 'relative',
    justifyContent: 'center',
  },
  volFill: {
    height: '100%',
    borderRadius: 3,
  },
  volThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    top: -5,
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default AudioControls;
