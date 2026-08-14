import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { productRepository } from '../../src/db/productRepository';
import { THEME } from '../../src/constants/theme';

const QUICK_CATEGORIES = ['Makanan', 'Minuman', 'Snack', 'Sembako', 'Rokok', 'Lainnya'];

export default function ProductFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = Boolean(params?.id);

  const [nama, setNama] = useState(params?.nama || '');
  const [kategori, setKategori] = useState(params?.kategori || '');
  const [harga, setHarga] = useState(params?.harga || '');
  const [foto, setFoto] = useState(params?.foto || '');
  const [barcode, setBarcode] = useState(params?.barcode || '');
  const [saving, setSaving] = useState(false);

  // Menerima update barcode dari scanner jika ada param balik
  useEffect(() => {
    if (params?.scannedBarcode) {
      setBarcode(params.scannedBarcode);
    }
  }, [params?.scannedBarcode]);

  // Fungsi memilih foto dari Galeri HP
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Izin Ditolak',
          'Izin akses galeri dibutuhkan untuk memilih foto produk lokal.'
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
        setFoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih gambar.');
    }
  };

  // Navigasi ke Scanner Barcode Kamera
  const openScanner = () => {
    router.push({
      pathname: '/products/scanner',
      params: { returnTo: 'form' },
    });
  };

  // Validasi dan Simpan ke SQLite
  const handleSave = () => {
    if (!nama.trim()) {
      Alert.alert('Peringatan', 'Nama barang wajib diisi.');
      return;
    }

    const numericPrice = parseFloat(harga.replace(/[^0-9]/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Peringatan', 'Harga barang harus berupa angka lebih dari 0.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        productRepository.updateProduct(params.id, {
          nama,
          kategori,
          harga: numericPrice,
          foto,
          barcode,
        });
      } else {
        productRepository.createProduct({
          nama,
          kategori,
          harga: numericPrice,
          foto,
          barcode,
        });
      }

      Alert.alert('Sukses', `Produk berhasil ${isEditing ? 'diperbarui' : 'disimpan'}!`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Gagal menyimpan produk ke database.');
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
        {/* Foto Produk Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            style={styles.photoContainer}
          >
            {foto ? (
              <Image source={{ uri: foto }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.photoLabel}>Pilih Foto</Text>
                <Text style={styles.photoSubLabel}>Dari Galeri</Text>
              </View>
            )}
          </TouchableOpacity>
          {foto ? (
            <TouchableOpacity onPress={() => setFoto('')} style={styles.deletePhotoBtn}>
              <Text style={styles.deletePhotoText}>Hapus Foto</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Input Nama Barang */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Nama Barang <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: Kopi Susu Aren 250ml"
            placeholderTextColor={THEME.colors.textMuted}
            value={nama}
            onChangeText={setNama}
          />
        </View>

        {/* Input Kategori */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Kategori</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: Minuman"
            placeholderTextColor={THEME.colors.textMuted}
            value={kategori}
            onChangeText={setKategori}
          />
          {/* Quick Categories chips */}
          <View style={styles.chipContainer}>
            {QUICK_CATEGORIES.map((cat) => {
              const isSelected = kategori === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setKategori(cat)}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Input Harga Jual */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Harga Jual (Rp) <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.priceInputWrapper}>
            <Text style={styles.currencyPrefix}>Rp</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="0"
              placeholderTextColor={THEME.colors.textMuted}
              keyboardType="numeric"
              value={harga}
              onChangeText={setHarga}
            />
          </View>
        </View>

        {/* Input Barcode & Scanner Button */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Barcode / Kode Unik (Opsional)</Text>
          <View style={styles.barcodeRow}>
            <TextInput
              style={[styles.textInput, styles.barcodeInput]}
              placeholder="Scan atau ketik barcode"
              placeholderTextColor={THEME.colors.textMuted}
              value={barcode}
              onChangeText={setBarcode}
            />
            <TouchableOpacity
              onPress={openScanner}
              activeOpacity={0.8}
              style={styles.scanButton}
            >
              <Text style={styles.scanButtonText}>📷 Scan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Produk Baru'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
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
  photoSection: {
    alignItems: 'center',
    marginVertical: THEME.spacing.sm,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: THEME.borderRadius.xl,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: THEME.colors.primaryLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  cameraIcon: {
    fontSize: 28,
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
    marginTop: THEME.spacing.sm,
  },
  deletePhotoText: {
    fontSize: 12,
    color: THEME.colors.danger,
    fontWeight: '600',
  },
  fieldGroup: {
    marginTop: THEME.spacing.lg,
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: THEME.spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chipSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    ...THEME.shadow.card,
  },
  currencyPrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: '700',
    padding: 0,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barcodeInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  scanButton: {
    backgroundColor: THEME.colors.primarySoft,
    borderWidth: 1,
    borderColor: THEME.colors.primaryLight,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  actionContainer: {
    marginTop: THEME.spacing.xxl,
    gap: 12,
  },
  saveButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    ...THEME.shadow.card,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: THEME.colors.borderLight,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
});
