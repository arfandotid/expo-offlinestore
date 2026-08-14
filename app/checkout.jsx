import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { THEME } from '../src/constants/theme';
import { formatRupiah } from '../src/components/ProductCard';
import CashPayment from '../src/components/CashPayment';
import QrisPayment from '../src/components/QrisPayment';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const totalPrice = parseFloat(params?.totalPrice) || 0;
  const totalItems = parseInt(params?.totalItems, 10) || 0;
  const cartItems = params?.cartJson ? JSON.parse(params.cartJson) : [];

  const [paymentMethod, setPaymentMethod] = useState('TUNAI'); // 'TUNAI' | 'QRIS'
  const [cashAmount, setCashAmount] = useState('');
  const [proofPhotoUri, setProofPhotoUri] = useState(null);

  // Validasi apakah transaksi dapat diselesaikan
  const numericCash = parseFloat(cashAmount.toString().replace(/[^0-9]/g, '')) || 0;
  const isCashValid = numericCash >= totalPrice;
  const isQrisValid = Boolean(proofPhotoUri);

  const canComplete = paymentMethod === 'TUNAI' ? isCashValid : isQrisValid;

  // Eksekusi penyelesaian transaksi
  const handleCompleteTransaction = () => {
    if (!canComplete) {
      if (paymentMethod === 'TUNAI') {
        Alert.alert('Uang Belum Cukup', 'Nominal uang yang diterima harus sama atau lebih besar dari total tagihan.');
      } else {
        Alert.alert('Foto Bukti Diperlukan', 'Harap ambil foto bukti transfer pelanggan sebelum menyelesaikan transaksi.');
      }
      return;
    }

    const changeAmount = paymentMethod === 'TUNAI' ? numericCash - totalPrice : 0;

    const transactionData = {
      items: cartItems,
      totalPrice,
      totalItems,
      paymentMethod,
      cashReceived: paymentMethod === 'TUNAI' ? numericCash : totalPrice,
      changeAmount,
      proofPhotoUri: paymentMethod === 'QRIS' ? proofPhotoUri : null,
      timestamp: new Date().toISOString(),
    };

    // Navigasi ke Layar Sukses (Fase 5)
    router.replace({
      pathname: '/success',
      params: {
        transactionJson: JSON.stringify(transactionData),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Total Tagihan */}
        <View style={styles.totalCard}>
          <View style={styles.totalInfo}>
            <Text style={styles.totalBadge}>Total Tagihan Transaksi</Text>
            <Text style={styles.totalPriceText}>{formatRupiah(totalPrice)}</Text>
            <Text style={styles.itemCountText}>Untuk {totalItems} item barang</Text>
          </View>
        </View>

        {/* Tab Switcher Metode Pembayaran */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('TUNAI')}
            style={[
              styles.tabBtn,
              paymentMethod === 'TUNAI' && styles.tabBtnActive,
            ]}
          >
            <Text style={styles.tabIcon}>💵</Text>
            <Text
              style={[
                styles.tabText,
                paymentMethod === 'TUNAI' && styles.tabTextActive,
              ]}
            >
              Tunai
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('QRIS')}
            style={[
              styles.tabBtn,
              paymentMethod === 'QRIS' && styles.tabBtnActive,
            ]}
          >
            <Text style={styles.tabIcon}>📱</Text>
            <Text
              style={[
                styles.tabText,
                paymentMethod === 'QRIS' && styles.tabTextActive,
              ]}
            >
              QRIS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Payment Body */}
        {paymentMethod === 'TUNAI' ? (
          <CashPayment
            totalPrice={totalPrice}
            cashAmount={cashAmount}
            onChangeCashAmount={setCashAmount}
          />
        ) : (
          <QrisPayment
            totalPrice={totalPrice}
            proofPhotoUri={proofPhotoUri}
            onSetProofPhoto={setProofPhotoUri}
          />
        )}

        {/* Action Button: Selesaikan Transaksi */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCompleteTransaction}
            style={[
              styles.completeBtn,
              !canComplete && styles.completeBtnDisabled,
            ]}
          >
            <Text
              style={[
                styles.completeBtnText,
                !canComplete && styles.completeBtnTextDisabled,
              ]}
            >
              ✓ Selesaikan Transaksi
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  totalCard: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadow.card,
  },
  totalInfo: {
    alignItems: 'center',
  },
  totalBadge: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  totalPriceText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 4,
  },
  itemCountText: {
    color: THEME.colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    padding: 4,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadow.card,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
  },
  tabBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  actionContainer: {
    marginTop: THEME.spacing.xl,
  },
  completeBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadow.card,
  },
  completeBtnDisabled: {
    backgroundColor: THEME.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  completeBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  completeBtnTextDisabled: {
    color: THEME.colors.textMuted,
  },
});
