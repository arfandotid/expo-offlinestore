import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, QrCode, Trash2, Save, Sun, Moon, Monitor } from 'lucide-react-native';
import { settingsRepository } from '../src/db/settingsRepository';
import { THEME } from '../src/constants/theme';
import { useTheme } from '../src/theme/ThemeProvider';

const THEME_OPTIONS = [
  { key: 'light', icon: Sun, label: 'Terang' },
  { key: 'dark', icon: Moon, label: 'Gelap' },
  { key: 'system', icon: Monitor, label: 'Sistem' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { mode: themeMode, setMode: setThemeMode, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [appName, setAppName] = useState('');
  const [logoUri, setLogoUri] = useState('');
  const [qrisUri, setQrisUri] = useState('');
  const [saving, setSaving] = useState(false);

  // Muat pengaturan dari SQLite saat layar di-focus
  useFocusEffect(
    useCallback(() => {
      const settings = settingsRepository.getSettings();
      setAppName(settings.app_name || '');
      setLogoUri(settings.app_logo_uri || '');
      setQrisUri(settings.qris_uri || '');
    }, [])
  );

  // Fungsi memilih gambar dari galeri HP
  const pickImage = async (onPick) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Izin Ditolak',
          'Izin akses galeri dibutuhkan untuk memilih gambar.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPick(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih gambar.');
    }
  };

  // Simpan pengaturan ke SQLite
  const handleSave = () => {
    if (!appName.trim()) {
      Alert.alert('Peringatan', 'Nama toko / aplikasi wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      settingsRepository.saveSettings({
        app_name: appName.trim(),
        app_logo_uri: logoUri,
        qris_uri: qrisUri,
      });
      Alert.alert('Sukses', 'Pengaturan berhasil disimpan!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Gagal menyimpan pengaturan ke database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
            color: colors.text,
          },
          headerTintColor: colors.primary,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nama Aplikasi / Toko */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Nama Toko / Aplikasi <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: POS TOKO OFFLINE"
            placeholderTextColor={colors.textMuted}
            value={appName}
            onChangeText={setAppName}
          />
          <Text style={styles.fieldHint}>
            Nama ini akan tampil pada struk pembayaran dan kartu QRIS.
          </Text>
        </View>

        {/* Tema Aplikasi */}
        <View style={styles.themeSection}>
          <Text style={styles.fieldLabel}>Tema Aplikasi</Text>
          <Text style={styles.fieldHint}>
            Pilih tampilan terang, gelap, atau ikuti tema sistem perangkat.
          </Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(({ key, icon: Icon, label }) => {
              const isActive = themeMode === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setThemeMode(key)}
                  activeOpacity={0.8}
                  style={[styles.themeBtn, isActive && styles.themeBtnActive]}
                >
                  <Icon size={16} color={isActive ? '#ffffff' : colors.textSecondary} />
                  <Text style={[styles.themeBtnText, isActive && styles.themeBtnTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Logo Aplikasi */}
        <View style={styles.photoSection}>
          <Text style={styles.fieldLabel}>Logo Aplikasi</Text>
          <Text style={styles.fieldHint}>Logo akan ditampilkan di bagian atas struk pembayaran.</Text>
          <TouchableOpacity
            onPress={() => pickImage(setLogoUri)}
            activeOpacity={0.8}
            style={styles.photoContainer}
          >
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.previewImage} resizeMode="contain" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <ImagePlus size={28} color={colors.primary} style={styles.placeholderIcon} />
                <Text style={styles.photoLabel}>Pilih Logo</Text>
                <Text style={styles.photoSubLabel}>Dari Galeri</Text>
              </View>
            )}
          </TouchableOpacity>
          {logoUri ? (
            <TouchableOpacity onPress={() => setLogoUri('')} style={styles.deletePhotoBtn}>
              <Trash2 size={12} color={colors.danger} />
              <Text style={styles.deletePhotoText}>Hapus Logo</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* QRIS Toko */}
        <View style={styles.photoSection}>
          <Text style={styles.fieldLabel}>QRIS Toko</Text>
          <Text style={styles.fieldHint}>
            Gambar QRIS ini akan tampil pada metode pembayaran QRIS di kasir.
          </Text>
          <TouchableOpacity
            onPress={() => pickImage(setQrisUri)}
            activeOpacity={0.8}
            style={styles.photoContainer}
          >
            {qrisUri ? (
              <Image source={{ uri: qrisUri }} style={styles.previewImage} resizeMode="contain" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <QrCode size={28} color={colors.primary} style={styles.placeholderIcon} />
                <Text style={styles.photoLabel}>Pilih QRIS</Text>
                <Text style={styles.photoSubLabel}>Dari Galeri</Text>
              </View>
            )}
          </TouchableOpacity>
          {qrisUri ? (
            <TouchableOpacity onPress={() => setQrisUri('')} style={styles.deletePhotoBtn}>
              <Trash2 size={12} color={colors.danger} />
              <Text style={styles.deletePhotoText}>Hapus QRIS</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Tombol Simpan */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={styles.saveButton}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveButtonText}>Simpan Pengaturan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (colors) => StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: THEME.spacing.lg,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: colors.danger,
  },
  fieldHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: -2,
  },
  themeSection: {
    marginBottom: THEME.spacing.xxl,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  themeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  themeBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    ...THEME.shadow.card,
  },
  photoSection: {
    marginBottom: THEME.spacing.xxl,
  },
  photoContainer: {
    width: 180,
    height: 180,
    borderRadius: THEME.borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    alignSelf: 'center',
    ...THEME.shadow.card,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    padding: THEME.spacing.sm,
  },
  placeholderIcon: {
    marginBottom: 4,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  photoSubLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  deletePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: THEME.spacing.sm,
  },
  deletePhotoText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: THEME.spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    ...THEME.shadow.card,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
