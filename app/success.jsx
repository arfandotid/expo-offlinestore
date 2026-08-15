import React, { useState, useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, CircleCheck, Download, Printer, Share2 } from 'lucide-react-native';
import { THEME } from '../src/constants/theme';
import { formatRupiah } from '../src/components/ProductCard';
import {
  downloadReceiptPdf,
  printReceiptPdf,
  shareReceiptPdf,
} from '../src/utils/receiptGenerator';

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [actionLoading, setActionLoading] = useState(null); // 'download' | 'print' | 'share' | null

  const transaction = params?.transactionJson ? JSON.parse(params.transactionJson) : null;

  // Jalankan aksi download / cetak / bagikan
  const runAction = useCallback(
    async (type) => {
      if (!transaction || actionLoading) return;
      setActionLoading(type);
      try {
        if (type === 'download') {
          await downloadReceiptPdf(transaction);
        } else if (type === 'print') {
          await printReceiptPdf(transaction);
        } else {
          await shareReceiptPdf(transaction);
        }
      } catch (error) {
        console.error(`Error ${type} receipt PDF:`, error);
        Alert.alert(
          'Gagal',
          error.message || 'Terjadi kesalahan saat memproses struk PDF.'
        );
      } finally {
        setActionLoading(null);
      }
    },
    [transaction, actionLoading]
  );

  // Selesaikan alur transaksi dan kembali ke kasir baru
  const handleFinishTransaction = () => {
    router.replace({ pathname: '/', params: { resetCart: '1' } });
  };

  const actions = [
    { key: 'download', icon: Download, label: 'Unduh' },
    { key: 'print', icon: Printer, label: 'Cetak' },
    { key: 'share', icon: Share2, label: 'Bagikan' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon & Header */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Check size={36} color="#ffffff" strokeWidth={3} />
          </View>
          <Text style={styles.successTitle}>Transaksi Berhasil!</Text>
          <Text style={styles.successSubtitle}>
            Pembayaran telah diterima dan dicatat.
          </Text>
        </View>

        {/* Ringkasan Detail Transaksi */}
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
              <Text style={styles.summaryValue}>{transaction.totalItems} produk</Text>
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
                <CircleCheck size={14} color={THEME.colors.primaryDark} />
                <Text style={styles.proofNote}>Foto bukti transfer tersimpan</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons: Unduh / Cetak / Bagikan */}
        <View style={styles.actionSection}>
          {actions.map(({ key, icon: Icon, label }) => {
            const isActive = actionLoading === key;
            const disabled = actionLoading !== null;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                disabled={disabled}
                onPress={() => runAction(key)}
                style={[styles.actionItem, disabled && styles.actionItemDisabled]}
              >
                <View style={[styles.actionIconCircle, isActive && styles.actionIconCircleActive]}>
                  {isActive ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Icon
                      size={20}
                      color={disabled ? THEME.colors.textMuted : THEME.colors.primaryDark}
                      strokeWidth={2.2}
                    />
                  )}
                </View>
                <Text style={[styles.actionLabel, disabled && styles.actionLabelDisabled]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tombol Selesai */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleFinishTransaction}
          style={styles.doneBtn}
        >
          <View style={styles.doneBtnContent}>
            <Check size={16} color="#ffffff" />
            <Text style={styles.doneBtnText}>Selesai</Text>
          </View>
        </TouchableOpacity>
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
    paddingTop: THEME.spacing.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  proofNote: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primaryDark,
  },
  actionSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    paddingVertical: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.xl,
    ...THEME.shadow.card,
  },
  actionItem: {
    alignItems: 'center',
    gap: 6,
  },
  actionItemDisabled: {
    opacity: 0.6,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.primarySoft,
    borderWidth: 1.5,
    borderColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconCircleActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  actionLabelDisabled: {
    color: THEME.colors.textMuted,
  },
  doneBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadow.card,
  },
  doneBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
