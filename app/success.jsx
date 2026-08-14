import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { THEME } from '../src/constants/theme';
import { formatRupiah } from '../src/components/ProductCard';
import { shareReceiptPdf } from '../src/utils/receiptGenerator';

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [sharing, setSharing] = useState(false);
  const transaction = params?.transactionJson ? JSON.parse(params.transactionJson) : null;

  // Bagikan Struk ke WhatsApp / Media lain via PDF
  const handleShareReceipt = async () => {
    if (!transaction) return;
    setSharing(true);
    try {
      await shareReceiptPdf(transaction);
    } catch (error) {
      console.error('Error sharing receipt PDF:', error);
      Alert.alert('Gagal Membagikan', error.message || 'Terjadi kesalahan saat membagikan struk PDF.');
    } finally {
      setSharing(false);
    }
  };

  // Selesaikan alur transaksi dan kembali ke kasir baru
  const handleFinishTransaction = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon & Header */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Transaksi Berhasil!</Text>
          <Text style={styles.successSubtitle}>
            Pembayaran telah diterima dan dicatat.
          </Text>
        </View>

        {/* Ringkasan Transaksi */}
        {transaction && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Metode Pembayaran</Text>
              <Text style={styles.summaryValueBadge}>{transaction.paymentMethod}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tagihan</Text>
              <Text style={styles.summaryValueBold}>{formatRupiah(transaction.totalPrice)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Jumlah Item</Text>
              <Text style={styles.summaryValue}>{transaction.totalItems} barang</Text>
            </View>

            {transaction.paymentMethod === 'TUNAI' && (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Uang Diterima</Text>
                  <Text style={styles.summaryValue}>{formatRupiah(transaction.cashReceived)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.changeRow]}>
                  <Text style={styles.changeLabel}>Kembalian</Text>
                  <Text style={styles.changeValue}>{formatRupiah(transaction.changeAmount)}</Text>
                </View>
              </>
            )}

            {transaction.paymentMethod === 'QRIS' && transaction.proofPhotoUri && (
              <View style={styles.proofNoteRow}>
                <Text style={styles.proofNote}>✓ Foto bukti transfer tersimpan</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons: Bagikan Struk & Selesai */}
        <View style={styles.actionSection}>
          {/* Tombol Bagikan Struk PDF / WhatsApp */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleShareReceipt}
            disabled={sharing}
            style={styles.shareBtn}
          >
            {sharing ? (
              <View style={styles.btnLoadingRow}>
                <ActivityIndicator size="small" color="#16a34a" />
                <Text style={styles.shareBtnTextLoading}>Menyiapkan PDF...</Text>
              </View>
            ) : (
              <View style={styles.btnContentRow}>
                <Text style={styles.shareBtnIcon}>📄</Text>
                <Text style={styles.shareBtnText}>Bagikan Struk (PDF / WhatsApp)</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Tombol Selesai (Transaksi Baru) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleFinishTransaction}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText}>✓ Selesai (Transaksi Baru)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingTop: THEME.spacing.xxl,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
    ...THEME.shadow.card,
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.xl,
    ...THEME.shadow.card,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  summaryLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: THEME.colors.text,
    fontWeight: '700',
  },
  summaryValueBold: {
    fontSize: 15,
    color: THEME.colors.text,
    fontWeight: '800',
  },
  summaryValueBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primaryDark,
    backgroundColor: THEME.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  changeRow: {
    backgroundColor: THEME.colors.primarySoft,
    marginHorizontal: -THEME.spacing.lg,
    marginBottom: -THEME.spacing.lg,
    marginTop: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 14,
    borderBottomLeftRadius: THEME.borderRadius.xl,
    borderBottomRightRadius: THEME.borderRadius.xl,
    borderBottomWidth: 0,
  },
  changeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  changeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.primaryDark,
  },
  proofNoteRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  proofNote: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primaryDark,
  },
  actionSection: {
    width: '100%',
    gap: 12,
  },
  shareBtn: {
    backgroundColor: THEME.colors.primarySoft,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    paddingVertical: 15,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  shareBtnText: {
    color: THEME.colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  shareBtnTextLoading: {
    color: THEME.colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  doneBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 15,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadow.card,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
