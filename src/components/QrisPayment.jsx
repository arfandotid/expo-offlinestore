import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { THEME } from '../constants/theme';
import { formatRupiah } from './ProductCard';

export default function QrisPayment({
  totalPrice,
  proofPhotoUri,
  onSetProofPhoto,
}) {
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
          <Text style={styles.qrisMerchant}>POS TOKO OFFLINE</Text>
        </View>

        {/* QR Pattern Placeholder Box */}
        <View style={styles.qrCodeBox}>
          <View style={styles.qrCornerTopLeft} />
          <View style={styles.qrCornerTopRight} />
          <View style={styles.qrCornerBottomLeft} />
          
          <Text style={styles.qrIcon}>📱</Text>
          <Text style={styles.qrHint}>NMID: ID102003847592</Text>
          <Text style={styles.qrAmountBadge}>{formatRupiah(totalPrice)}</Text>
        </View>

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
              <Text style={styles.verifiedText}>✓ Bukti Terlampir</Text>
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
                <Text style={styles.retakeBtnText}>📷 Foto Ulang</Text>
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
            <Text style={styles.cameraIcon}>📸</Text>
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

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.sm,
  },
  qrisCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
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
    borderBottomColor: THEME.colors.borderLight,
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
    color: THEME.colors.textSecondary,
  },
  qrCodeBox: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: THEME.colors.text,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: THEME.spacing.sm,
    padding: THEME.spacing.md,
  },
  qrCornerTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    backgroundColor: THEME.colors.text,
    borderRadius: 4,
  },
  qrCornerTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: THEME.colors.text,
    borderRadius: 4,
  },
  qrCornerBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 28,
    height: 28,
    backgroundColor: THEME.colors.text,
    borderRadius: 4,
  },
  qrIcon: {
    fontSize: 44,
    marginBottom: 4,
  },
  qrHint: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontFamily: 'monospace',
  },
  qrAmountBadge: {
    marginTop: 6,
    backgroundColor: THEME.colors.primarySoft,
    color: THEME.colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '800',
  },
  scanInstruction: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: THEME.spacing.sm,
    lineHeight: 16,
  },
  proofSection: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
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
    color: THEME.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    backgroundColor: THEME.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    color: THEME.colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  requiredText: {
    color: THEME.colors.danger,
    fontSize: 11,
    fontWeight: '600',
  },
  takePhotoBtn: {
    borderWidth: 2,
    borderColor: THEME.colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.background,
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  takePhotoText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  takePhotoHint: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  previewContainer: {
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
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
    backgroundColor: THEME.colors.surface,
  },
  retakeBtn: {
    backgroundColor: THEME.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retakeBtnText: {
    color: THEME.colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteProofBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteProofText: {
    color: THEME.colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});
