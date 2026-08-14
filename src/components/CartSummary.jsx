import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { THEME } from '../constants/theme';
import { ChevronUp, ChevronDown, ArrowRight } from 'lucide-react-native';
import { formatRupiah } from './ProductCard';

export default function CartSummary({
  totalItems,
  totalPrice,
  onToggleExpand,
  isExpanded,
  onCheckout,
}) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Info & Expand Toggle */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggleExpand}
          style={styles.infoArea}
        >
          <View style={styles.badgeRow}>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{totalItems} Item</Text>
            </View>
            <View style={styles.expandRow}>
              <Text style={styles.expandLabel}>
                {isExpanded ? 'Tutup Detail' : 'Lihat Keranjang'}
              </Text>
              {isExpanded ? (
                <ChevronDown size={12} color={THEME.colors.textSecondary} />
              ) : (
                <ChevronUp size={12} color={THEME.colors.textSecondary} />
              )}
            </View>
          </View>
          <Text style={styles.totalPriceText}>{formatRupiah(totalPrice)}</Text>
        </TouchableOpacity>

        {/* Checkout Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onCheckout}
          style={styles.checkoutBtn}
        >
          <Text style={styles.checkoutBtnText}>Checkout</Text>
          <ArrowRight size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : THEME.spacing.md,
    ...THEME.shadow.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoArea: {
    flex: 1,
    marginRight: THEME.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  countBadge: {
    backgroundColor: THEME.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeText: {
    color: THEME.colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  expandLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: THEME.borderRadius.lg,
    ...THEME.shadow.card,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6,
  },
});
