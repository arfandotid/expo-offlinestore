import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TriangleAlert, Printer, Download, Share2, Trash2 } from 'lucide-react-native';
import { transactionRepository } from '../../src/db/transactionRepository';
import { THEME } from '../../src/constants/theme';
import { useTheme } from '../../src/theme/ThemeProvider';
import { formatRupiah } from '../../src/components/ProductCard';
import {
  shareReceiptPdf,
  printReceiptPdf,
  downloadReceiptPdf,
} from '../../src/utils/receiptGenerator';
import { formatTransactionNo } from '../../src/utils/transactionNumber';

function formatFullDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // 'download' | 'print' | 'share' | null

  // Format data transaksi agar seragam dengan receiptGenerator
  const buildReceiptData = (transaction) => ({
    id: transaction.id,
    items: transaction.items.map((item) => ({
      product: {
        nama: item.nama_produk,
        harga: item.harga_satuan,
      },
      qty: item.qty,
    })),
    totalPrice: transaction.total_tagihan,
    totalItems: transaction.items.reduce((sum, item) => sum + item.qty, 0),
    paymentMethod: transaction.metode_bayar,
    cashReceived: transaction.nominal_bayar,
    changeAmount: transaction.kembalian,
    timestamp: transaction.tanggal,
  });

  useEffect(() => {
    if (id) {
      try {
        const data = transactionRepository.getTransactionDetails(Number(id));
        setTransaction(data);
      } catch (error) {
        console.error('Error fetching transaction detail:', error);
        Alert.alert('Error', 'Gagal memuat detail transaksi.');
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  // Jalankan aksi unduh / cetak / bagikan struk
  const runAction = useCallback(
    async (type) => {
      if (!transaction || actionLoading) return;
      setActionLoading(type);
      try {
        if (type === 'download') {
          await downloadReceiptPdf(buildReceiptData(transaction));
        } else if (type === 'print') {
          await printReceiptPdf(buildReceiptData(transaction));
        } else {
          await shareReceiptPdf(buildReceiptData(transaction));
        }
      } catch (error) {
        console.error(`Error ${type} receipt:`, error);
        Alert.alert(
          'Gagal',
          error.message || 'Terjadi kesalahan saat memproses struk.'
        );
      } finally {
        setActionLoading(null);
      }
    },
    [transaction, actionLoading]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat detail transaksi...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.notFoundContainer}>
        <TriangleAlert size={48} color={colors.textSecondary} />
        <Text style={styles.notFoundTitle}>Transaksi Tidak Ditemukan</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Kembali ke Riwayat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Hapus transaksi beserta rinciannya
  const handleDeleteTransaction = () => {
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            try {
              const deleted = transactionRepository.deleteTransaction(transaction.id);
              if (deleted) {
                router.back();
              } else {
                Alert.alert('Gagal', 'Transaksi tidak ditemukan atau gagal dihapus.');
              }
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Gagal menghapus transaksi.');
            }
          },
        },
      ]
    );
  };

  const isQris = transaction.metode_bayar === 'QRIS';

  const actions = [
    { key: 'download', icon: Download, label: 'Unduh' },
    { key: 'print', icon: Printer, label: 'Cetak' },
    { key: 'share', icon: Share2, label: 'Bagikan' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Nota & Tanggal */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.receiptLabel}>No. Nota Transaksi</Text>
              <Text style={styles.receiptNo}>
                {formatTransactionNo(transaction.id, transaction.tanggal)}
              </Text>
            </View>
            <View
              style={[
                styles.methodBadge,
                isQris ? styles.badgeQris : styles.badgeCash,
              ]}
            >
              <Text
                style={[
                  styles.methodBadgeText,
                  isQris ? styles.badgeTextQris : styles.badgeTextCash,
                ]}
              >
                {transaction.metode_bayar}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>{formatFullDate(transaction.tanggal)}</Text>
        </View>

        {/* Tabel Detail Produk yang Dibeli */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rincian Produk Belanja</Text>
          <View style={styles.divider} />

          {transaction.items && transaction.items.map((item, idx) => (
            <View key={item.id || idx} style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{item.nama_produk}</Text>
                <Text style={styles.itemSub}>
                  {item.qty} × {formatRupiah(item.harga_satuan)}
                </Text>
              </View>
              <Text style={styles.itemSubtotal}>{formatRupiah(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Rincian Pembayaran */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Tagihan</Text>
            <Text style={styles.summaryValueBold}>
              {formatRupiah(transaction.total_tagihan)}
            </Text>
          </View>

          {transaction.metode_bayar === 'TUNAI' ? (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Uang Tunai Diterima</Text>
                <Text style={styles.summaryValue}>
                  {formatRupiah(transaction.nominal_bayar)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.changeHighlight]}>
                <Text style={styles.changeLabel}>Kembalian</Text>
                <Text style={styles.changeValue}>
                  {formatRupiah(transaction.kembalian)}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status Pembayaran</Text>
              <Text style={styles.paidStatus}>LUNAS (QRIS)</Text>
            </View>
          )}
        </View>

        {/* Foto Bukti Transfer QRIS (Jika Ada) */}
        {isQris && transaction.bukti_qris ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Foto Bukti Transfer QRIS</Text>
            <View style={styles.divider} />
            <View style={styles.proofImageWrapper}>
              <Image
                source={{ uri: transaction.bukti_qris }}
                style={styles.proofImage}
                resizeMode="cover"
              />
            </View>
          </View>
        ) : null}

        {/* Action Buttons: Unduh / Cetak / Bagikan (sama seperti checkout berhasil) */}
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
                      color={disabled ? colors.textMuted : colors.primaryDark}
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

        {/* Action Button: Hapus Transaksi */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleDeleteTransaction}
          style={styles.deleteBtn}
        >
          <View style={styles.btnContentRow}>
            <Trash2 size={18} color={colors.danger} style={styles.shareBtnIcon} />
            <Text style={styles.deleteBtnText}>Hapus Transaksi</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: THEME.spacing.sm,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xl,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  backBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: THEME.spacing.md,
    ...THEME.shadow.card,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  receiptNo: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  methodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeCash: {
    backgroundColor: colors.primarySoft,
  },
  badgeQris: {
    backgroundColor: colors.infoBg,
  },
  methodBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  badgeTextCash: {
    color: colors.primaryDark,
  },
  badgeTextQris: {
    color: colors.infoText,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: THEME.spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: THEME.spacing.md,
    ...THEME.shadow.card,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: THEME.spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemMain: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  itemSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  changeHighlight: {
    backgroundColor: colors.primarySoft,
    marginHorizontal: -THEME.spacing.lg,
    marginBottom: -THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 12,
    borderBottomLeftRadius: THEME.borderRadius.xl,
    borderBottomRightRadius: THEME.borderRadius.xl,
  },
  changeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  changeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  paidStatus: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  proofImageWrapper: {
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  proofImage: {
    width: '100%',
    height: 220,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: THEME.borderRadius.xl,
    paddingVertical: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
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
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  actionLabelDisabled: {
    color: colors.textMuted,
  },
  deleteBtn: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerDark,
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '800',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtnIcon: {
    marginRight: 8,
  },
});
