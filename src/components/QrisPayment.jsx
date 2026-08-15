import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Smartphone, Camera, CircleCheck } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useTheme } from '../theme/ThemeProvider';
import { formatRupiah } from './ProductCard';
import { settingsRepository } from '../db/settingsRepository';

export default function QrisPayment({
  totalPrice,
  proofPhotoUri,
  onSetProofPhoto,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [settings, setSettings] = useState(settingsRepository.getSettings());

  useEffect(() => {
    setSettings(settingsRepository.getSettings());
  }, []);

  const merchantName = settings.app_name || 'POS TOKO OFFLINE';
  const qrisUri = settings.qris_uri || null;
  // Ambil foto bukti transfer menggunakan kamera HP
  const handleTakeProofPhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin Kamera Ditolak',
          'Aplikasi membutuhkan izin kamera untuk memotret bukti transfer QRIS pelanggan.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onSetProofPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error capturing proof photo:', error);
      Alert.alert('Error', 'Gagal membuka kamera bukti transfer.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Box QRIS Statis Toko */}
      <View style={styles.qrisCard}>
        <View style={styles.qrisHeader}>
          <Text style={styles.qrisLogo}>QRIS</Text>
          <Text style={styles.qrisMerchant}>{merchantName}</Text>
        </View>

        {/* Gambar QRIS Toko (dari Pengaturan) */}
        {qrisUri ? (
          <View style={styles.qrImageBox}>
            <Image
              source={{ uri: qrisUri }}
              style={styles.qrisImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.qrCodeBox}>
            <View style={styles.qrCornerTopLeft} />
            <View style={styles.qrCornerTopRight} />
            <View style={styles.qrCornerBottomLeft} />

            <Smartphone size={44} color={colors.text} style={styles.qrIcon} />
            <Text style={styles.qrHint}>NMID: ID102003847592</Text>
          </View>
        )}

        <Text style={styles.qrAmountBadge}>{formatRupiah(totalPrice)}</Text>

        <Text style={styles.scanInstruction}>
          Minta pelanggan memindai QRIS di atas dengan aplikasi m-Banking atau e-Wallet apapun.
        </Text>
      </View>

      {/* Bagian Bukti Foto Transfer */}
      <View style={styles.proofSection}>
        <View style={styles.proofHeader}>
          <Text style={styles.proofLabel}>Foto Bukti Transfer Pelanggan</Text>
          {proofPhotoUri ? (
            <View style={styles.verifiedBadge}>
              <CircleCheck size={12} color={colors.primaryDark} />
              <Text style={styles.verifiedText}>Bukti Terlampir</Text>
            </View>
          ) : (
            <Text style={styles.requiredText}>* Wajib ada foto</Text>
          )}
        </View>

        {proofPhotoUri ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: proofPhotoUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.previewActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleTakeProofPhoto}
                style={styles.retakeBtn}
              >
                <Camera size={12} color={colors.primaryDark} />
                <Text style={styles.retakeBtnText}>Foto Ulang</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onSetProofPhoto(null)}
                style={styles.deleteProofBtn}
              >
                <Text style={styles.deleteProofText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleTakeProofPhoto}
            style={styles.takePhotoBtn}
          >
            <Camera size={32} color={colors.primary} style={styles.cameraIcon} />
            <Text style={styles.takePhotoText}>Ambil Foto Bukti Transfer</Text>
            <Text style={styles.takePhotoHint}>
              Potret layar HP pelanggan setelah transfer sukses
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.sm,
  },
  qrisCard: {
    backgroundColor: colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadow.card,
  },
  qrisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  qrisLogo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#d92626',
    letterSpacing: 1,
  },
  qrisMerchant: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  qrCodeBox: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: colors.text,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: THEME.spacing.sm,
    padding: THEME.spacing.md,
  },
  qrImageBox: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: THEME.spacing.sm,
  },
  qrisImage: {
    width: '100%',
    height: '100%',
  },
  qrCornerTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    backgroundColor: colors.text,
    borderRadius: 4,
  },
  qrCornerTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: colors.text,
    borderRadius: 4,
  },
  qrCornerBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 28,
    height: 28,
    backgroundColor: colors.text,
    borderRadius: 4,
  },
  qrIcon: {
    marginBottom: 4,
  },
  qrHint: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  qrAmountBadge: {
    marginTop: 6,
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '800',
  },
  scanInstruction: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: THEME.spacing.sm,
    lineHeight: 16,
  },
  proofSection: {
    backgroundColor: colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...THEME.shadow.card,
  },
  proofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  proofLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  requiredText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '600',
  },
  takePhotoBtn: {
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  cameraIcon: {
    marginBottom: 6,
  },
  takePhotoText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  takePhotoHint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  previewContainer: {
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#000000',
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: THEME.spacing.sm,
    backgroundColor: colors.surface,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retakeBtnText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteProofBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteProofText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});
