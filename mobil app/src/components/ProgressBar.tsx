import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
  progress: number;
  height?: number;
  showThumb?: boolean;
  onSeek?: (progress: number) => void;
  disabled?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 6,
  showThumb = false,
  onSeek,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const accentColor = '#137fec';

  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  const clamped = clamp(progress);

  const [dragging, setDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(clamped);
  const barWidth = useRef(0);
  const thumbScale = useRef(new Animated.Value(1)).current;

  const displayed = dragging ? dragProgress : clamped;

  const calcProgress = (x: number) => {
    if (barWidth.current === 0) return displayed;
    return clamp((x / barWidth.current) * 100);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !!onSeek,
      onMoveShouldSetPanResponder: () => !disabled && !!onSeek,
      onPanResponderGrant: (e) => {
        setDragging(true);
        Animated.spring(thumbScale, { toValue: 1.3, useNativeDriver: true, friction: 6 }).start();
        const p = calcProgress(e.nativeEvent.locationX);
        setDragProgress(p);
      },
      onPanResponderMove: (e) => {
        const p = calcProgress(e.nativeEvent.locationX);
        setDragProgress(p);
      },
      onPanResponderRelease: (e) => {
        const p = calcProgress(e.nativeEvent.locationX);
        setDragging(false);
        Animated.spring(thumbScale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
        onSeek?.(p);
      },
      onPanResponderTerminate: () => {
        setDragging(false);
        Animated.spring(thumbScale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
      },
    }),
  ).current;

  const trackColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
  const thumbSize = 22;

  return (
    <View
      style={[styles.hitArea, { paddingVertical: showThumb ? 14 : 6 }]}
      onLayout={(e) => { barWidth.current = e.nativeEvent.layout.width; }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height }]}>
        {/* Dolgu */}
        <View
          style={[
            styles.fill,
            {
              width: `${displayed}%`,
              height,
              backgroundColor: accentColor,
              borderRadius: height,
            },
          ]}
        />

        {/* Thumb */}
        {showThumb && (
          <Animated.View
            style={[
              styles.thumb,
              {
                left: `${displayed}%`,
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                marginLeft: -(thumbSize / 2),
                top: -(thumbSize / 2 - height / 2),
                backgroundColor: '#fff',
                borderColor: accentColor,
                borderWidth: 3,
                shadowColor: accentColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: dragging ? 0.5 : 0.35,
                shadowRadius: dragging ? 10 : 6,
                elevation: dragging ? 10 : 6,
                transform: [{ scale: thumbScale }],
              },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hitArea: {
    width: '100%',
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {},
  thumb: {
    position: 'absolute',
  },
});

export default ProgressBar;
