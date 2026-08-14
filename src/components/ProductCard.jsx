import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { THEME } from '../constants/theme';

/**
 * Format angka ke format mata uang Rupiah
 */
export function formatRupiah(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductCard({ product, onEdit, onDelete }) {
  const { nama, kategori, harga, foto, barcode } = product;

  return (
    <View style={styles.card}>
      {/* Thumbnail Foto Produk */}
      <View style={styles.imageWrapper}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.placeholderIcon}>📦</Text>
        )}
      </View>

      {/* Info Produk */}
      <View style={styles.infoContainer}>
        <View style={styles.tagRow}>
          {kategori ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{kategori}</Text>
            </View>
          ) : null}
          {barcode ? (
            <View style={styles.barcodeBadge}>
              <Text style={styles.barcodeText}>#{barcode}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.productName} numberOfLines={1}>
          {nama}
        </Text>
        <Text style={styles.productPrice}>{formatRupiah(harga)}</Text>
      </View>

      {/* Aksi Edit & Hapus */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => onEdit(product)}
          activeOpacity={0.7}
          style={styles.editButton}
        >
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(product)}
          activeOpacity={0.7}
          style={styles.deleteButton}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    ...THEME.shadow.card,
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.background,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderIcon: {
    fontSize: 28,
  },
  infoContainer: {
    flex: 1,
    marginLeft: THEME.spacing.md,
    marginRight: THEME.spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: THEME.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    color: THEME.colors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  barcodeBadge: {
    backgroundColor: THEME.colors.badgeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  barcodeText: {
    color: THEME.colors.badgeText,
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  productName: {
    color: THEME.colors.text,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  productPrice: {
    color: THEME.colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 14,
  },
});
