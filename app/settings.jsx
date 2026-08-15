import React, { useState, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, QrCode, Trash2, Save } from 'lucide-react-native';
import { settingsRepository } from '../src/db/settingsRepository';
import { THEME } from '../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();

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
            placeholderTextColor={THEME.colors.textMuted}
            value={appName}
            onChangeText={setAppName}
          />
          <Text style={styles.fieldHint}>
            Nama ini akan tampil pada struk pembayaran dan kartu QRIS.
          </Text>
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
                <ImagePlus size={28} color={THEME.colors.primary} style={styles.placeholderIcon} />
                <Text style={styles.photoLabel}>Pilih Logo</Text>
                <Text style={styles.photoSubLabel}>Dari Galeri</Text>
              </View>
            )}
          </TouchableOpacity>
          {logoUri ? (
            <TouchableOpacity onPress={() => setLogoUri('')} style={styles.deletePhotoBtn}>
              <Trash2 size={12} color={THEME.colors.danger} />
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
                <QrCode size={28} color={THEME.colors.primary} style={styles.placeholderIcon} />
                <Text style={styles.photoLabel}>Pilih QRIS</Text>
                <Text style={styles.photoSubLabel}>Dari Galeri</Text>
              </View>
            )}
          </TouchableOpacity>
          {qrisUri ? (
            <TouchableOpacity onPress={() => setQrisUri('')} style={styles.deletePhotoBtn}>
              <Trash2 size={12} color={THEME.colors.danger} />
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
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: THEME.colors.background,
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
    color: THEME.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: THEME.colors.danger,
  },
  fieldHint: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginBottom: 8,
    marginTop: -2,
  },
  textInput: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    color: THEME.colors.text,
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
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: THEME.colors.primaryLight,
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
    color: THEME.colors.primary,
  },
  photoSubLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
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
    color: THEME.colors.danger,
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
    backgroundColor: THEME.colors.primary,
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
