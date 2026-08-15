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
import { useRouter, useFocusEffect, useLocalSearchParams, Tabs } from 'expo-router';
import { Search, Barcode, X, ShoppingCart, ArrowRight } from 'lucide-react-native';
import { productRepository } from '../../src/db/productRepository';
import CatalogCard from '../../src/components/CatalogCard';
import CartItem from '../../src/components/CartItem';
import CartSummary from '../../src/components/CartSummary';
import EmptyState from '../../src/components/EmptyState';
import CategoryFilter from '../../src/components/CategoryFilter';
import HeaderActions from '../../src/components/HeaderActions';
import { THEME } from '../../src/constants/theme';
import { useTheme } from '../../src/theme/ThemeProvider';
import { formatRupiah } from '../../src/components/ProductCard';

export default function SalesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // Array: { product: Object, qty: Number }
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartModalVisible, setCartModalVisible] = useState(false);

  // Memuat daftar kategori dari database SQLite
  const loadCategories = useCallback(() => {
    try {
      setCategories(productRepository.getCategories());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Memuat data katalog dari database SQLite
  const loadProducts = useCallback(() => {
    try {
      let results;
      if (selectedCategory) {
        results = productRepository.getProductsByCategory(selectedCategory, searchQuery);
      } else if (searchQuery.trim()) {
        results = productRepository.searchProducts(searchQuery);
      } else {
        results = productRepository.getAllProducts();
      }
      setProducts(results);
    } catch (error) {
      console.error('Error loading products for catalog:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Muat ulang saat layar di-focus
  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadProducts();

      // Reset keranjang setelah transaksi selesai (parameter dari layar success)
      if (params?.resetCart === '1') {
        setCart([]);
        setCartModalVisible(false);
        router.setParams({ resetCart: undefined });
      }
    }, [loadProducts, loadCategories, params?.resetCart])
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

  // Toggle bar pencarian dari ikon di navbar
  const toggleSearch = () => {
    if (searchVisible) {
      setSearchQuery('');
      setSearchVisible(false);
    } else {
      setSearchVisible(true);
    }
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
      <Tabs.Screen
        options={{
          headerRight: () => (
            <HeaderActions>
              <TouchableOpacity
                onPress={toggleSearch}
                style={styles.headerActionBtn}
                hitSlop={8}
              >
                {searchVisible ? (
                  <X size={22} color={colors.text} />
                ) : (
                  <Search size={22} color={colors.text} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openScanner}
                style={styles.headerActionBtn}
                hitSlop={8}
              >
                <Barcode size={22} color={colors.text} />
              </TouchableOpacity>
            </HeaderActions>
          ),
        }}
      />

      {/* Header Search & Scanner Bar */}
      <View style={styles.headerArea}>
        {searchVisible && (
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <Search size={15} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari menu / nama produk..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <X size={14} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Filter Kategori */}
        <View style={styles.categoryFilterWrap}>
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>
      </View>

      {/* Grid Katalog Produk (2 Kolom) */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat katalog...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.catalogRow}
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
              icon={
                <Search size={36} color={colors.primary} />
              }
              title={
                selectedCategory && !searchQuery
                  ? 'Kategori Masih Kosong'
                  : searchQuery
                  ? 'Produk Tidak Ditemukan'
                  : 'Katalog Masih Kosong'
              }
              subtitle={
                selectedCategory && !searchQuery
                  ? `Belum ada produk di kategori "${selectedCategory}".`
                  : searchQuery
                  ? `Tidak ada produk yang cocok dengan "${searchQuery}"${
                      selectedCategory ? ` di kategori "${selectedCategory}"` : ''
                    }.`
                  : 'Belum ada produk yang terdaftar. Tambahkan master produk terlebih dahulu pada tab Kelola Produk.'
              }
              actionText={
                selectedCategory && !searchQuery
                  ? 'Lihat Semua Kategori'
                  : searchQuery
                  ? 'Reset Pencarian'
                  : 'Buka Kelola Produk'
              }
              onAction={() => {
                if (selectedCategory && !searchQuery) {
                  setSelectedCategory(null);
                } else if (searchQuery) {
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
                <Text style={styles.modalSubtitle}>{totalItems} produk dipilih</Text>
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
                  <X size={14} color={colors.textSecondary} />
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
                  <ShoppingCart size={48} color={colors.textMuted} />
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
                  <ArrowRight size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerArea: {
    backgroundColor: colors.surface,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...THEME.shadow.card,
  },
  headerActionBtn: {
    padding: 6,
    marginLeft: THEME.spacing.xs,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  categoryFilterWrap: {
    marginHorizontal: -THEME.spacing.lg,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: THEME.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: THEME.spacing.sm,
  },
  catalogList: {
    padding: THEME.spacing.sm,
    paddingBottom: 100,
  },
  catalogRow: {
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
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
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
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
    backgroundColor: colors.dangerLight,
  },
  clearCartText: {
    color: colors.dangerDark,
    fontSize: 12,
    fontWeight: '700',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartItemList: {
    padding: THEME.spacing.lg,
  },
  emptyCartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
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
    color: colors.textSecondary,
  },
  modalTotalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  modalCheckoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
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
});
