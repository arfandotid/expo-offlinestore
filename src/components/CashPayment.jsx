import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { THEME } from '../constants/theme';
import { formatRupiah } from './ProductCard';

export default function CashPayment({
  totalPrice,
  cashAmount,
  onChangeCashAmount,
}) {
  // Hitung saran pecahan uang cepat
  const quickSuggestions = useMemo(() => {
    const suggestions = [];

    // Opsi 1: Uang Pas
    suggestions.push({ label: 'Uang Pas', value: totalPrice });

    // Pecahan standar Rupiah
    const standardDenominations = [
      10000, 20000, 50000, 100000, 200000, 500000
    ];

    // Pembulatan ke 10rb atau 50rb di atas total harga jika bukan pecahan standar
    const next10k = Math.ceil(totalPrice / 10000) * 10000;
    if (next10k > totalPrice && !standardDenominations.includes(next10k)) {
      suggestions.push({ label: formatRupiah(next10k), value: next10k });
    }

    // Masukkan pecahan standar yang lebih besar dari total harga
    for (const denom of standardDenominations) {
      if (denom > totalPrice && suggestions.length < 5) {
        suggestions.push({ label: formatRupiah(denom), value: denom });
      }
    }

    return suggestions;
  }, [totalPrice]);

  const numericCash = parseFloat(cashAmount.toString().replace(/[^0-9]/g, '')) || 0;
  const change = numericCash - totalPrice;
  const isEnough = numericCash >= totalPrice;

  return (
    <View style={styles.container}>
      {/* Input Nominal Uang Tunai */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionLabel}>Uang Diterima dari Pelanggan</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.currencyPrefix}>Rp</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0"
            placeholderTextColor={THEME.colors.textMuted}
            keyboardType="numeric"
            value={cashAmount ? cashAmount.toString() : ''}
            onChangeText={(text) => onChangeCashAmount(text.replace(/[^0-9]/g, ''))}
            autoFocus
          />
          {cashAmount ? (
            <TouchableOpacity
              onPress={() => onChangeCashAmount('')}
              style={styles.clearBtn}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Saran Uang Cepat (Quick Cash Chips) */}
      <View style={styles.suggestionSection}>
        <Text style={styles.suggestionLabel}>Pilihan Cepat:</Text>
        <View style={styles.chipsContainer}>
          {quickSuggestions.map((item, idx) => {
            const isSelected = numericCash === item.value;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.75}
                onPress={() => onChangeCashAmount(item.value.toString())}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Box Kalkulasi Kembalian */}
      <View
        style={[
          styles.changeBox,
          isEnough ? styles.changeBoxSuccess : styles.changeBoxWarning,
        ]}
      >
        <View style={styles.changeInfo}>
          <Text style={styles.changeTitle}>
            {isEnough ? 'Kembalian' : 'Kekurangan Uang'}
          </Text>
          <Text
            style={[
              styles.changeAmount,
              isEnough ? styles.changeAmountSuccess : styles.changeAmountWarning,
            ]}
          >
            {isEnough ? formatRupiah(change) : formatRupiah(Math.abs(change))}
          </Text>
        </View>
        <Text style={styles.changeStatusIcon}>
          {isEnough ? (change === 0 ? '👌' : '💵') : '⚠️'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.sm,
  },
  inputSection: {
    marginBottom: THEME.spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 14,
    ...THEME.shadow.card,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.text,
    padding: 0,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    fontWeight: 'bold',
  },
  suggestionSection: {
    marginBottom: THEME.spacing.lg,
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    ...THEME.shadow.card,
  },
  chipSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  changeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
  },
  changeBoxSuccess: {
    backgroundColor: THEME.colors.primarySoft,
    borderColor: THEME.colors.primaryLight,
  },
  changeBoxWarning: {
    backgroundColor: THEME.colors.dangerLight,
    borderColor: '#fca5a5',
  },
  changeInfo: {
    flex: 1,
  },
  changeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  changeAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  changeAmountSuccess: {
    color: THEME.colors.primaryDark,
  },
  changeAmountWarning: {
    color: THEME.colors.dangerDark,
  },
  changeStatusIcon: {
    fontSize: 28,
    marginLeft: 12,
  },
});
