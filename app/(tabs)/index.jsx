import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { productRepository } from '../../src/db/productRepository';
import CatalogCard from '../../src/components/CatalogCard';
import CartItem from '../../src/components/CartItem';
import CartSummary from '../../src/components/CartSummary';
import EmptyState from '../../src/components/EmptyState';
import { THEME } from '../../src/constants/theme';
import { formatRupiah } from '../../src/components/ProductCard';

export default function SalesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // Array: { product: Object, qty: Number }
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartModalVisible, setCartModalVisible] = useState(false);

  // Memuat data katalog dari database SQLite
  const loadProducts = useCallback(() => {
    try {
      if (searchQuery.trim()) {
        const results = productRepository.searchProducts(searchQuery);
        setProducts(results);
      } else {
        const all = productRepository.getAllProducts();
        setProducts(all);
      }
    } catch (error) {
      console.error('Error loading products for catalog:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Muat ulang saat layar di-focus
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  // Handle barcode yang di-scan dari kamera
  useEffect(() => {
    if (params?.scannedBarcode) {
      const barcodeValue = params.scannedBarcode;
      try {
        const found = productRepository.getProductByBarcode(barcodeValue);
        if (found) {
          addToCart(found);
          Alert.alert('Produk Ditemukan', `"${found.nama}" berhasil ditambahkan ke keranjang.`);
        } else {
          Alert.alert(
            'Produk Tidak Ditemukan',
            `Tidak ada produk dengan kode barcode "${barcodeValue}".`
          );
        }
      } catch (err) {
        console.error('Error finding scanned product:', err);
      }
    }
  }, [params?.scannedBarcode]);

  // Fungsi menambah ke keranjang
  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + 1,
        };
        return updated;
      }
      return [...prevCart, { product, qty: 1 }];
    });
  }, []);

  // Update kuantitas item di keranjang
  const updateQty = useCallback((productId, newQty) => {
    setCart((prevCart) => {
      if (newQty <= 0) {
        return prevCart.filter((item) => item.product.id !== productId);
      }
      return prevCart.map((item) =>
        item.product.id === productId ? { ...item, qty: newQty } : item
      );
    });
  }, []);

  // Hapus item dari keranjang
  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }, []);

  // Kosongkan keranjang
  const clearCart = useCallback(() => {
    Alert.alert('Kosongkan Keranjang', 'Hapus semua item dari keranjang?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Kosongkan',
        style: 'destructive',
        onPress: () => {
          setCart([]);
          setCartModalVisible(false);
        },
      },
    ]);
  }, []);

  // Hitung total item dan total harga
  const { totalItems, totalPrice } = useMemo(() => {
    let itemsCount = 0;
    let priceSum = 0;
    for (const item of cart) {
      itemsCount += item.qty;
      priceSum += item.product.harga * item.qty;
    }
    return { totalItems: itemsCount, totalPrice: priceSum };
  }, [cart]);

  // Map qty per product untuk badge di katalog
  const cartQtyMap = useMemo(() => {
    const map = {};
    for (const item of cart) {
      map[item.product.id] = item.qty;
    }
    return map;
  }, [cart]);

  // Buka kamera scanner barcode kasir
  const openScanner = () => {
    router.push({
      pathname: '/products/scanner',
      params: { returnTo: 'sales' },
    });
  };

  // Navigasi ke Layar Checkout Pembayaran (Fase 4)
  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCartModalVisible(false);
    router.push({
      pathname: '/checkout',
      params: {
        cartJson: JSON.stringify(cart),
        totalPrice: totalPrice.toString(),
        totalItems: totalItems.toString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Search & Scanner Bar */}
      <View style={styles.headerArea}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari menu / nama barang..."
              placeholderTextColor={THEME.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tombol Scan Barcode Kasir */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openScanner}
            style={styles.scanBtn}
          >
            <Text style={styles.scanBtnIcon}>📷</Text>
            <Text style={styles.scanBtnText}>Scan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid Katalog Produk (2 Kolom) */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Memuat katalog...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.catalogList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CatalogCard
              product={item}
              onAddToCart={addToCart}
              cartQty={cartQtyMap[item.id] || 0}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={searchQuery ? '🔍' : '📦'}
              title={searchQuery ? 'Produk Tidak Ditemukan' : 'Katalog Masih Kosong'}
              subtitle={
                searchQuery
                  ? `Tidak ada barang yang cocok dengan "${searchQuery}".`
                  : 'Belum ada produk yang terdaftar. Tambahkan master barang terlebih dahulu pada tab Kelola Barang.'
              }
              actionText={searchQuery ? 'Reset Pencarian' : 'Buka Kelola Barang'}
              onAction={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  router.push('/products');
                }
              }}
            />
          }
        />
      )}

      {/* Sticky Bottom Cart Summary */}
      <CartSummary
        totalItems={totalItems}
        totalPrice={totalPrice}
        isExpanded={cartModalVisible}
        onToggleExpand={() => setCartModalVisible(true)}
        onCheckout={handleCheckout}
      />

      {/* Modal Detail Keranjang Belanja */}
      <Modal
        visible={cartModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCartModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalContent}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Keranjang Belanja</Text>
                <Text style={styles.modalSubtitle}>{totalItems} barang dipilih</Text>
              </View>

              <View style={styles.modalHeaderActions}>
                {cart.length > 0 && (
                  <TouchableOpacity
                    onPress={clearCart}
                    activeOpacity={0.7}
                    style={styles.clearCartBtn}
                  >
                    <Text style={styles.clearCartText}>Kosongkan</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setCartModalVisible(false)}
                  activeOpacity={0.7}
                  style={styles.closeModalBtn}
                >
                  <Text style={styles.closeModalText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* List Item Keranjang */}
            <FlatList
              data={cart}
              keyExtractor={(item) => item.product.id.toString()}
              contentContainerStyle={styles.cartItemList}
              renderItem={({ item }) => (
                <CartItem
                  item={item}
                  onUpdateQty={updateQty}
                  onRemove={removeFromCart}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyCartBox}>
                  <Text style={styles.emptyCartIcon}>🛒</Text>
                  <Text style={styles.emptyCartText}>Keranjang belanja Anda kosong</Text>
                </View>
              }
            />

            {/* Footer Modal Keranjang */}
            {cart.length > 0 && (
              <View style={styles.modalFooter}>
                <View style={styles.modalTotalRow}>
                  <Text style={styles.modalTotalLabel}>Total Pembayaran</Text>
                  <Text style={styles.modalTotalPrice}>{formatRupiah(totalPrice)}</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleCheckout}
                  style={styles.modalCheckoutBtn}
                >
                  <Text style={styles.modalCheckoutText}>Lanjut ke Pembayaran</Text>
                  <Text style={styles.modalCheckoutArrow}>→</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  headerArea: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    ...THEME.shadow.card,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: THEME.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: THEME.colors.text,
    fontSize: 14,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primarySoft,
    borderWidth: 1,
    borderColor: THEME.colors.primaryLight,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginLeft: 8,
  },
  scanBtnIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  scanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: THEME.spacing.sm,
  },
  catalogList: {
    padding: THEME.spacing.sm,
    paddingBottom: 100,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.xl,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearCartBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: THEME.colors.dangerLight,
  },
  clearCartText: {
    color: THEME.colors.dangerDark,
    fontSize: 12,
    fontWeight: '700',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  closeModalText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartItemList: {
    padding: THEME.spacing.lg,
  },
  emptyCartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCartIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyCartText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
    backgroundColor: THEME.colors.surface,
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  modalTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  modalTotalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  modalCheckoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.lg,
    ...THEME.shadow.card,
  },
  modalCheckoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  modalCheckoutArrow: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
