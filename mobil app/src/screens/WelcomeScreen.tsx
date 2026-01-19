import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <TouchableOpacity style={styles.accessibilityButton}>
          <Ionicons name="accessibility" size={28} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        <View style={styles.heroImageContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', theme.colors.background]}
            style={styles.heroGradient}
          />
          <View style={[styles.iconOverlay, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="headset" size={40} color={theme.colors.primary} />
          </View>
        </View>

        <View style={styles.textSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Sesin Gücüyle{'\n'}
            <Text style={{ color: theme.colors.primary }}>Okuyun</Text>
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Binlerce kitaba anında sesli erişim sağlayın. Görme engelli bireyler için özel olarak
            tasarlandı.
          </Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('MainTabs' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Başla</Text>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpLink}>
          <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
            Yardım mı lazım?
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.base,
    paddingTop: spacing['2xl'],
  },
  accessibilityButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  heroImageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: spacing.base,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  textSection: {
    alignItems: 'center',
    gap: spacing.base,
  },
  title: {
    fontSize: typography.fontSize['6xl'],
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    lineHeight: typography.fontSize['6xl'] * typography.lineHeight.tight,
  },
  description: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * typography.lineHeight.relaxed,
    paddingHorizontal: spacing.base,
  },
  actionsSection: {
    padding: spacing.xl,
    gap: spacing.base,
    paddingTop: spacing['2xl'],
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#fff',
  },
  secondaryButton: {
    height: 60,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  helpLink: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
});

export default WelcomeScreen;

