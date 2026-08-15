import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter, useFocusEffect, Tabs } from 'expo-router';
import { Search, X, Plus } from 'lucide-react-native';
import { productRepository } from '../../src/db/productRepository';
import ProductCard from '../../src/components/ProductCard';
import EmptyState from '../../src/components/EmptyState';
import CategoryFilter from '../../src/components/CategoryFilter';
import { THEME } from '../../src/constants/theme';

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memuat daftar kategori dari database SQLite
  const loadCategories = useCallback(() => {
    try {
      setCategories(productRepository.getCategories());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Memuat data produk dari database SQLite
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
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Gagal memuat daftar produk dari database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  // Otomatis refresh saat layar dibuka kembali
  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadProducts();
    }, [loadCategories, loadProducts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
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

  const handleEdit = (product) => {
    router.push({
      pathname: '/products/form',
      params: {
        id: product.id,
        nama: product.nama,
        kategori: product.kategori,
        harga: product.harga.toString(),
        foto: product.foto || '',
        barcode: product.barcode || '',
      },
    });
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Hapus Produk',
      `Apakah Anda yakin ingin menghapus "${product.nama}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            try {
              productRepository.deleteProduct(product.id);
              loadProducts();
            } catch (err) {
              console.error('Error deleting product:', err);
              Alert.alert('Error', 'Gagal menghapus produk.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Tabs.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={toggleSearch}
                style={styles.headerActionBtn}
                hitSlop={8}
              >
                {searchVisible ? (
                  <X size={22} color={THEME.colors.text} />
                ) : (
                  <Search size={22} color={THEME.colors.text} />
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Search Header Bar */}
      <View style={styles.searchHeader}>
        {searchVisible && (
          <View style={styles.searchInputWrapper}>
            <Search size={16} color={THEME.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama barang atau barcode..."
              placeholderTextColor={THEME.colors.textMuted}
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
              clearButtonMode="while-editing"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <X size={14} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            )}
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

      {/* Main List Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Memuat data produk...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME.colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={
                <Search size={36} color={THEME.colors.primary} />
              }
              title={
                selectedCategory && !searchQuery
                  ? 'Kategori Masih Kosong'
                  : searchQuery
                  ? 'Produk Tidak Ditemukan'
                  : 'Belum Ada Barang'
              }
              subtitle={
                selectedCategory && !searchQuery
                  ? `Belum ada barang di kategori "${selectedCategory}".`
                  : searchQuery
                  ? `Tidak ada barang yang cocok dengan kata kunci "${searchQuery}"${
                      selectedCategory ? ` di kategori "${selectedCategory}"` : ''
                    }.`
                  : 'Mulai daftarkan master barang toko Anda dengan menekan tombol Tambah Barang di bawah.'
              }
              actionText={
                selectedCategory && !searchQuery
                  ? 'Lihat Semua Kategori'
                  : searchQuery
                  ? 'Reset Pencarian'
                  : '+ Tambah Barang Baru'
              }
              onAction={() => {
                if (selectedCategory && !searchQuery) {
                  setSelectedCategory(null);
                } else if (searchQuery) {
                  setSearchQuery('');
                } else {
                  router.push('/products/form');
                }
              }}
            />
          }
        />
      )}

      {/* Floating Action Button (FAB) Tambah Barang */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          onPress={() => router.push('/products/form')}
          activeOpacity={0.85}
          style={styles.fab}
        >
          <Text style={styles.fabText}>Tambah Barang</Text>
          <Plus size={20} color="#ffffff" style={styles.fabPlus} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  searchHeader: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    ...THEME.shadow.card,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  headerActionBtn: {
    padding: 6,
  },
  searchInputWrapper: {
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
  categoryFilterWrap: {
    marginTop: THEME.spacing.md,
    marginHorizontal: -THEME.spacing.lg,
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
  listContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 96,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.full,
    ...THEME.shadow.fab,
  },
  fabPlus: {
    marginLeft: 8,
  },
  fabText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
