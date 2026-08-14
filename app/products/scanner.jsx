import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, X, Flashlight, Zap } from 'lucide-react-native';
import { THEME } from '../../src/constants/theme';

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  // Jika izin belum siap
  if (!permission) {
    return <View style={styles.darkBackground} />;
  }

  // Jika izin ditolak / belum diberikan
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={48} color="#ffffff" style={styles.permissionIcon} />
        <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
        <Text style={styles.permissionSubtitle}>
          Aplikasi membutuhkan akses kamera HP untuk memindai barcode produk secara otomatis.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          activeOpacity={0.8}
          style={styles.permissionBtn}
        >
          <Text style={styles.permissionBtnText}>Berikan Izin Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    // Kirim barcode kembali ke layar sebelumnya
    if (params?.returnTo === 'sales') {
      router.navigate({
        pathname: '/',
        params: { scannedBarcode: data },
      });
    } else {
      router.navigate({
        pathname: '/products/form',
        params: {
          ...params,
          scannedBarcode: data,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr',
            'ean13',
            'ean8',
            'code128',
            'code39',
            'upc_a',
            'upc_e',
            'itf14',
            'datamatrix',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay Mask */}
      <View style={styles.overlay}>
        {/* Top bar controls */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.circleBtn}
          >
            <X size={18} color="#ffffff" />
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>Scan Barcode Produk</Text>

          <TouchableOpacity
            onPress={() => setTorch(!torch)}
            activeOpacity={0.7}
            style={[styles.circleBtn, torch && styles.circleBtnActive]}
          >
            {torch ? (
              <Flashlight size={18} color="#ffffff" />
            ) : (
              <Zap size={18} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Viewfinder Center Box */}
        <View style={styles.viewfinderCenter}>
          <View style={styles.targetBox}>
            <View style={styles.laserLine} />
          </View>
          <View style={styles.hintBadge}>
            <Text style={styles.hintText}>Arahkan kamera ke barcode produk</Text>
          </View>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomArea}>
          {scanned && (
            <TouchableOpacity
              onPress={() => setScanned(false)}
              style={styles.rescanBtn}
            >
              <Text style={styles.rescanBtnText}>Scan Ulang</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  darkBackground: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xl,
  },
  permissionIcon: {
    marginBottom: THEME.spacing.md,
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  permissionSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
    maxWidth: 280,
    lineHeight: 18,
  },
  permissionBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
  },
  permissionBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  backBtn: {
    padding: THEME.spacing.sm,
  },
  backBtnText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: THEME.spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  circleBtnActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#f59e0b',
  },
  topBarTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  viewfinderCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBox: {
    width: 260,
    height: 200,
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  laserLine: {
    width: 220,
    height: 2,
    backgroundColor: '#22c55e',
  },
  hintBadge: {
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomArea: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  rescanBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  rescanBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
