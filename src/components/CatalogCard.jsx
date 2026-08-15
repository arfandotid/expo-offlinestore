import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { formatRupiah } from './ProductCard';

export default function CatalogCard({ product, onAddToCart, cartQty = 0 }) {
  const { nama, kategori, harga, foto } = product;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onAddToCart(product)}
      style={styles.card}
    >
      {/* Thumbnail Foto */}
      <View style={styles.imageContainer}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.image} resizeMode="cover" />
        ) : (
          <Package size={36} color={THEME.colors.textMuted} />
        )}

        {/* Badge jika sudah di keranjang */}
        {cartQty > 0 && (
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyBadgeText}>{cartQty}</Text>
          </View>
        )}
      </View>

      {/* Info Produk */}
      <View style={styles.infoContainer}>
        {kategori ? (
          <Text style={styles.categoryText} numberOfLines={1}>
            {kategori}
          </Text>
        ) : null}
        <Text style={styles.nameText} numberOfLines={2}>
          {nama}
        </Text>
        <Text style={styles.priceText}>
          {formatRupiah(harga)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginVertical: 6,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    ...THEME.shadow.card,
  },
  imageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  qtyBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: THEME.colors.primary,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  qtyBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  infoContainer: {
    padding: THEME.spacing.md,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.text,
    minHeight: 34,
    lineHeight: 17,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 4,
  },
});
