import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { THEME } from '../constants/theme';
import { useTheme } from '../theme/ThemeProvider';
import { Package, Minus, Plus } from 'lucide-react-native';
import { formatRupiah } from './ProductCard';

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
          <Package size={20} color={colors.textMuted} />
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
          <Minus size={16} color={colors.textSecondary} strokeWidth={2.5} />
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
          <Plus size={16} color={colors.primaryDark} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    marginBottom: 2,
  },
  unitPriceText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  subtotalText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  qtyController: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepBtnAdd: {
    backgroundColor: colors.primarySoft,
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
    color: colors.text,
  },
  qtyInput: {
    minWidth: 32,
    height: 32,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    backgroundColor: colors.surface,
    padding: 0,
  },
});
