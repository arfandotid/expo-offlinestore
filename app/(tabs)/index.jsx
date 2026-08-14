import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function SalesScreen() {
  return (
    <View style={styles.container}>
      {/* Header status bar mini */}
      <View style={styles.headerCard}>
        <Text style={styles.headerBadge}>POS Mode Aktif (100% Offline)</Text>
        <Text style={styles.headerTitle}>Kasir Penjualan</Text>
        <Text style={styles.headerSubtitle}>Siap melayani transaksi kasir</Text>
      </View>

      {/* Placeholder content untuk Fase 3 */}
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderIcon}>🛒</Text>
        <Text style={styles.placeholderTitle}>Katalog Produk & Keranjang</Text>
        <Text style={styles.placeholderSubtitle}>
          Fondasi Fase 1 & 2 telah aktif. Katalog penjualan dan keranjang transaksi akan diimplementasikan pada Fase 3.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.lg,
  },
  headerCard: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadow.card,
  },
  headerBadge: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  headerSubtitle: {
    color: THEME.colors.primaryLight,
    fontSize: 13,
    marginTop: 4,
  },
  placeholderCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    fontSize: 44,
    marginBottom: THEME.spacing.md,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    lineHeight: 18,
  },
});
