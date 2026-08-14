import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { THEME } from '../constants/theme';
import { Package, Minus, Plus } from 'lucide-react-native';
import { formatRupiah } from './ProductCard';

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const { product, qty } = item;
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [customQty, setCustomQty] = useState(qty.toString());

  const handleQtySubmit = () => {
    setIsEditingQty(false);
    const parsed = parseInt(customQty, 10);
    if (isNaN(parsed) || parsed <= 0) {
      onRemove(product.id);
    } else {
      onUpdateQty(product.id, parsed);
    }
  };

  const subtotal = product.harga * qty;

  return (
    <View style={styles.container}>
      {/* Thumbnail Foto */}
      <View style={styles.imageContainer}>
        {product.foto ? (
          <Image source={{ uri: product.foto }} style={styles.image} resizeMode="cover" />
        ) : (
          <Package size={20} color={THEME.colors.textMuted} />
        )}
      </View>

      {/* Info Produk */}
      <View style={styles.infoContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {product.nama}
        </Text>
        <Text style={styles.unitPriceText}>
          {formatRupiah(product.harga)}
        </Text>
        <Text style={styles.subtotalText}>
          Total: {formatRupiah(subtotal)}
        </Text>
      </View>

      {/* Stepper Qty Controller */}
      <View style={styles.qtyController}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onUpdateQty(product.id, qty - 1)}
          style={styles.stepBtn}
        >
          <Minus size={16} color={THEME.colors.textSecondary} strokeWidth={2.5} />
        </TouchableOpacity>

        {isEditingQty ? (
          <TextInput
            style={styles.qtyInput}
            keyboardType="number-pad"
            value={customQty}
            autoFocus
            selectTextOnFocus
            onChangeText={setCustomQty}
            onBlur={handleQtySubmit}
            onSubmitEditing={handleQtySubmit}
          />
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setCustomQty(qty.toString());
              setIsEditingQty(true);
            }}
            style={styles.qtyDisplay}
          >
            <Text style={styles.qtyText}>{qty}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onUpdateQty(product.id, qty + 1)}
          style={[styles.stepBtn, styles.stepBtnAdd]}
        >
          <Plus size={16} color={THEME.colors.primaryDark} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    marginLeft: THEME.spacing.md,
    marginRight: THEME.spacing.sm,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  unitPriceText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  subtotalText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginTop: 2,
  },
  qtyController: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
  },
  stepBtnAdd: {
    backgroundColor: THEME.colors.primarySoft,
  },
  qtyDisplay: {
    minWidth: 32,
    paddingHorizontal: 6,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  qtyInput: {
    minWidth: 32,
    height: 32,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.text,
    backgroundColor: '#ffffff',
    padding: 0,
  },
});
