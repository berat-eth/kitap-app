import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAudioPlayer } from '../context/AudioPlayerContext';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const { theme, toggleTheme, themeMode } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { playerState, setPlaybackRate } = useAudioPlayer();
  const [highContrast, setHighContrast] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(playerState.playbackRate);
  const [voiceTone, setVoiceTone] = useState<'deep' | 'clear' | 'soft'>('clear');

  const handleSpeedChange = (value: number) => {
    setPlaybackSpeed(value);
    setPlaybackRate(value);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ses Ayarları</Text>

        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.settingHeader}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Okuma Hızı</Text>
            <Text style={[styles.settingValue, { color: theme.colors.primary }]}>
              {playbackSpeed.toFixed(1)}x
            </Text>
          </View>
          <View style={styles.sliderContainer}>
            <Ionicons name="speedometer-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.sliderWrapper}>
              <View style={[styles.sliderTrack, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width: `${((playbackSpeed - 0.5) / 2.5) * 100}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${((playbackSpeed - 0.5) / 2.5) * 100}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
            <Ionicons name="timer-outline" size={24} color={theme.colors.textSecondary} />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: theme.colors.textSecondary }]}>Yavaş</Text>
            <Text style={[styles.sliderLabel, { color: theme.colors.textSecondary }]}>Hızlı</Text>
          </View>
        </View>

        <View style={styles.voiceToneSection}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Ses Tonu</Text>
          <View style={styles.voiceToneGrid}>
            {(['deep', 'clear', 'soft'] as const).map((tone) => (
              <TouchableOpacity
                key={tone}
                style={[
                  styles.voiceToneCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: voiceTone === tone ? theme.colors.primary : theme.colors.border,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setVoiceTone(tone)}
              >
                <View
                  style={[
                    styles.voiceToneIcon,
                    {
                      backgroundColor:
                        voiceTone === tone ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={tone === 'deep' ? 'pulse' : tone === 'clear' ? 'mic' : 'water'}
                    size={24}
                    color={voiceTone === tone ? '#fff' : theme.colors.text}
                  />
                </View>
                <Text style={[styles.voiceToneText, { color: theme.colors.text }]}>
                  {tone === 'deep' ? 'Derin' : tone === 'clear' ? 'Net' : 'Yumuşak'}
                </Text>
                <View
                  style={[
                    styles.radioButton,
                    {
                      borderColor: voiceTone === tone ? theme.colors.primary : theme.colors.border,
                      backgroundColor: voiceTone === tone ? theme.colors.primary : 'transparent',
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Görünüm</Text>

        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: `${theme.colors.primary}20` },
                ]}
              >
                <Ionicons name="contrast" size={24} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Yüksek Kontrast
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Daha belirgin metin ve kenarlıklar
                </Text>
              </View>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: `${theme.colors.primary}20` },
                ]}
              >
                <Ionicons name="moon" size={24} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Karanlık Mod</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Göz yorgunluğunu azaltır
                </Text>
              </View>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Genel</Text>

        {[
          { icon: 'notifications-outline', label: 'Bildirimler', color: '#3b82f6' },
          { icon: 'person-outline', label: 'Hesap Bilgileri', color: '#10b981' },
          { icon: 'help-circle-outline', label: 'Yardım ve Geri Bildirim', color: '#a855f7' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.settingRow}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: `${item.color}20` },
                ]}
              >
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: `${theme.colors.error}20` }]}
      >
        <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
        <Text style={[styles.logoutText, { color: theme.colors.error }]}>Çıkış Yap</Text>
      </TouchableOpacity>

      <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
        Versiyon 2.4.0
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing['4xl'],
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.base,
  },
  settingCard: {
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.base,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  settingLabel: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
  },
  settingValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  sliderWrapper: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    borderRadius: borderRadius.full,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: borderRadius.full,
  },
  sliderThumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    top: -10,
    marginLeft: -14,
    borderWidth: 2,
    borderColor: '#fff',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginTop: spacing.xs,
  },
  sliderLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  voiceToneSection: {
    marginTop: spacing.base,
  },
  voiceToneGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  voiceToneCard: {
    flex: 1,
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  voiceToneIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceToneText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    borderWidth: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: spacing.xl,
    marginHorizontal: spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.xl,
    marginTop: spacing['2xl'],
    borderWidth: 1,
  },
  logoutText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  versionText: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginTop: spacing['2xl'],
  },
});

export default SettingsScreen;

