import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import { uploadFile, submitBook, getDeviceId, registerDevice } from '../config/api';
import { Platform } from 'react-native';

type SubmitBookScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SubmitBook'>;

interface ChapterInput {
  id: string;
  title: string;
  audioFile: DocumentPicker.DocumentPickerAsset | null;
}

const SubmitBookScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SubmitBookScreenNavigationProp>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [narratorName, setNarratorName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterInput[]>([
    { id: '1', title: '', audioFile: null },
  ]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const categories = [
    'Roman',
    'Bilim Kurgu',
    'Fantastik',
    'Polisiye',
    'Tarih',
    'Biyografi',
    'Kişisel Gelişim',
    'Çocuk',
    'Şiir',
    'Diğer',
  ];

  const pickCoverImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin Gerekli', 'Kapak fotoğrafı seçmek için galeri izni gereklidir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const pickAudioFile = async (chapterId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setChapters(prev =>
          prev.map(ch =>
            ch.id === chapterId ? { ...ch, audioFile: result.assets[0] } : ch
          )
        );
      }
    } catch (error) {
      Alert.alert('Hata', 'Ses dosyası seçilirken bir hata oluştu.');
    }
  };

  const addChapter = () => {
    const newId = (chapters.length + 1).toString();
    setChapters([...chapters, { id: newId, title: '', audioFile: null }]);
  };

  const removeChapter = (chapterId: string) => {
    if (chapters.length <= 1) {
      Alert.alert('Uyarı', 'En az bir bölüm olmalıdır.');
      return;
    }
    setChapters(prev => prev.filter(ch => ch.id !== chapterId));
  };

  const updateChapterTitle = (chapterId: string, title: string) => {
    setChapters(prev =>
      prev.map(ch => (ch.id === chapterId ? { ...ch, title } : ch))
    );
  };

  const validateForm = (): boolean => {
    if (!bookTitle.trim()) {
      Alert.alert('Uyarı', 'Lütfen kitap adını girin.');
      return false;
    }
    if (!authorName.trim()) {
      Alert.alert('Uyarı', 'Lütfen yazar adını girin.');
      return false;
    }
    if (!narratorName.trim()) {
      Alert.alert('Uyarı', 'Lütfen seslendiren adını girin.');
      return false;
    }
    if (!category) {
      Alert.alert('Uyarı', 'Lütfen bir kategori seçin.');
      return false;
    }
    if (!coverImage) {
      Alert.alert('Uyarı', 'Lütfen kapak fotoğrafı ekleyin.');
      return false;
    }
    
    const emptyChapters = chapters.filter(ch => !ch.title.trim() || !ch.audioFile);
    if (emptyChapters.length > 0) {
      Alert.alert('Uyarı', 'Tüm bölümlerin başlığı ve ses dosyası olmalıdır.');
      return false;
    }

    if (!agreedToTerms) {
      Alert.alert('Uyarı', 'Devam etmek için şartları kabul etmelisiniz.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Cihaz kaydı kontrolü
      let deviceId = await getDeviceId();
      if (!deviceId) {
        const platformName = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';
        deviceId = await registerDevice(`${platformName} Cihaz`, platformName);
      }
      if (!deviceId) {
        Alert.alert('Hata', 'Cihaz kaydı yapılamadı. Lütfen internet bağlantınızı kontrol edin.');
        setIsSubmitting(false);
        return;
      }

      // Kapak yükle
      let coverUrl: string | undefined;
      if (coverImage) {
        coverUrl = await uploadFile(coverImage, 'image/jpeg', 'cover.jpg');
      }

      // Bölüm ses dosyalarını yükle
      const chaptersWithUrls: { title: string; order_num: number; audio_url: string }[] = [];
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        if (!ch.audioFile) {
          throw new Error(`Bölüm ${i + 1} için ses dosyası seçin`);
        }
        const mimeType = ch.audioFile.mimeType || 'audio/mpeg';
        const name = ch.audioFile.name || `chapter_${i + 1}.mp3`;
        const audioUrl = await uploadFile(ch.audioFile.uri, mimeType, name);
        chaptersWithUrls.push({
          title: ch.title.trim(),
          order_num: i + 1,
          audio_url: audioUrl,
        });
      }

      await submitBook({
        title: bookTitle.trim(),
        author: authorName.trim(),
        narrator: narratorName.trim(),
        description: description.trim() || undefined,
        category,
        cover_image: coverUrl,
        chapters: chaptersWithUrls,
      });

      Alert.alert(
        'Başarılı!',
        'Kitabınız başarıyla gönderildi. İnceleme sürecinden sonra yayınlanacaktır.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Hata', error?.message || 'Kitap gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Kitap Gönder</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: `${theme.colors.primary}15` }]}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Kendi yazdığınız veya seslendirdiğiniz kitapları buradan gönderebilirsiniz. 
            Gönderilen kitaplar incelendikten sonra yayınlanacaktır.
          </Text>
        </View>

        {/* Cover Image */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kapak Fotoğrafı *</Text>
          <TouchableOpacity
            style={[styles.coverPicker, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={pickCoverImage}
          >
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverPreview} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="image-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.coverPlaceholderText, { color: theme.colors.textSecondary }]}>
                  Kapak fotoğrafı seçin
                </Text>
                <Text style={[styles.coverHint, { color: theme.colors.textSecondary }]}>
                  Önerilen oran: 2:3
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Book Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kitap Bilgileri</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Kitap Adı *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Kitabınızın adını girin"
              placeholderTextColor={theme.colors.textSecondary}
              value={bookTitle}
              onChangeText={setBookTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Yazar *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Yazarın adını girin"
              placeholderTextColor={theme.colors.textSecondary}
              value={authorName}
              onChangeText={setAuthorName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Seslendiren *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Seslendiren kişinin adını girin"
              placeholderTextColor={theme.colors.textSecondary}
              value={narratorName}
              onChangeText={setNarratorName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Açıklama</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Kitabınız hakkında kısa bir açıklama yazın"
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Kategori *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category === cat ? theme.colors.primary : theme.colors.surface,
                      borderColor: category === cat ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: category === cat ? '#fff' : theme.colors.text },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Chapters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Bölümler *</Text>
            <TouchableOpacity
              style={[styles.addChapterButton, { backgroundColor: theme.colors.primary }]}
              onPress={addChapter}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addChapterText}>Bölüm Ekle</Text>
            </TouchableOpacity>
          </View>

          {chapters.map((chapter, index) => (
            <View
              key={chapter.id}
              style={[styles.chapterCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <View style={styles.chapterHeader}>
                <Text style={[styles.chapterNumber, { color: theme.colors.primary }]}>
                  Bölüm {index + 1}
                </Text>
                {chapters.length > 1 && (
                  <TouchableOpacity onPress={() => removeChapter(chapter.id)}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[styles.chapterInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder="Bölüm başlığı"
                placeholderTextColor={theme.colors.textSecondary}
                value={chapter.title}
                onChangeText={(text) => updateChapterTitle(chapter.id, text)}
              />

              <TouchableOpacity
                style={[styles.audioPickerButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={() => pickAudioFile(chapter.id)}
              >
                <Ionicons
                  name={chapter.audioFile ? 'checkmark-circle' : 'musical-notes-outline'}
                  size={24}
                  color={chapter.audioFile ? theme.colors.success : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.audioPickerText,
                    { color: chapter.audioFile ? theme.colors.success : theme.colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {chapter.audioFile ? chapter.audioFile.name : 'Ses dosyası seç (MP3, M4A, WAV)'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: agreedToTerms ? theme.colors.primary : 'transparent',
                  borderColor: agreedToTerms ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              {agreedToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={[styles.termsText, { color: theme.colors.text }]}>
              Bu içeriğin telif haklarına sahip olduğumu veya yayınlama iznine sahip olduğumu onaylıyorum. 
              <Text style={{ color: theme.colors.primary }}> Kullanım Şartları</Text>'nı kabul ediyorum.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            isSubmitting && { opacity: 0.7 },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Kitabı Gönder</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerNote, { color: theme.colors.textSecondary }]}>
          Gönderilen kitaplar 3-5 iş günü içinde incelenir. Onaylanan kitaplar uygulamada yayınlanır.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  infoBanner: {
    flexDirection: 'row',
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.md,
  },
  coverPicker: {
    height: 200,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  coverPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coverPlaceholderText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
  coverHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  inputGroup: {
    marginBottom: spacing.base,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
  },
  textArea: {
    height: 100,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  addChapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  addChapterText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
  },
  chapterCard: {
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chapterNumber: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
  },
  chapterInput: {
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    marginBottom: spacing.sm,
  },
  audioPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  audioPickerText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.base,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    marginTop: spacing.base,
    lineHeight: 18,
  },
});

export default SubmitBookScreen;
