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
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, X, Plus } from 'lucide-react-native';
import { productRepository } from '../../src/db/productRepository';
import ProductCard from '../../src/components/ProductCard';
import EmptyState from '../../src/components/EmptyState';
import { THEME } from '../../src/constants/theme';

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memuat data produk dari database SQLite
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
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Gagal memuat daftar produk dari database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  // Otomatis refresh saat layar dibuka kembali
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
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
      {/* Search Header Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputWrapper}>
          <Search size={16} color={THEME.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama barang atau barcode..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <X size={14} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Counter Info Bar */}
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            Total {products.length} barang terdaftar
          </Text>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Offline SQLite</Text>
          </View>
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
              title={searchQuery ? 'Produk Tidak Ditemukan' : 'Belum Ada Barang'}
              subtitle={
                searchQuery
                  ? `Tidak ada barang yang cocok dengan kata kunci "${searchQuery}".`
                  : 'Mulai daftarkan master barang toko Anda dengan menekan tombol Tambah Barang di bawah.'
              }
              actionText={searchQuery ? 'Reset Pencarian' : '+ Tambah Barang Baru'}
              onAction={() => {
                if (searchQuery) {
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
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.md,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
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
