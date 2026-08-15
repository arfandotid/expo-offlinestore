import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useTheme } from '../theme/ThemeProvider';
import { formatRupiah } from './ProductCard';
import { formatTransactionNo } from '../utils/transactionNumber';

/**
 * Format tanggal dan waktu singkat
 */
function formatSimpleDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TransactionCard({ transaction, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id, tanggal, total_tagihan, metode_bayar, total_items, total_qty } = transaction;

  const isQris = metode_bayar === 'QRIS';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(transaction)}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.idGroup}>
          <Text style={styles.receiptNo}>{formatTransactionNo(id, tanggal)}</Text>
          <Text style={styles.dateText}>{formatSimpleDate(tanggal)}</Text>
        </View>

        <View
          style={[
            styles.badge,
            isQris ? styles.badgeQris : styles.badgeCash,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isQris ? styles.badgeTextQris : styles.badgeTextCash,
            ]}
          >
            {metode_bayar}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.itemsSummary}>
            {total_qty || total_items || 1} produk terjual
          </Text>
          <Text style={styles.totalPrice}>{formatRupiah(total_tagihan)}</Text>
        </View>

        <View style={styles.arrowButton}>
          <Text style={styles.arrowText}>Detail</Text>
          <ArrowRight size={12} color={colors.primaryDark} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...THEME.shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  idGroup: {
    flex: 1,
  },
  receiptNo: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'monospace',
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
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
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  badgeTextCash: {
    color: colors.primaryDark,
  },
  badgeTextQris: {
    color: colors.infoText,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: THEME.spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsSummary: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  arrowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  arrowText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
