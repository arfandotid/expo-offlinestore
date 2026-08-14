import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { productRepository } from '../../src/db/productRepository';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const data = productRepository.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <View className="flex-1 bg-slate-50 p-4">
      {/* DB Status Badge */}
      <View className="flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-sm">
        <View className="flex-row items-center space-x-2">
          <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
          <Text className="text-sm font-semibold text-slate-800">
            Status Database SQLite
          </Text>
        </View>
        <Text className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full">
          Tabel Ready
        </Text>
      </View>

      {/* Placeholder content untuk Fase 2 */}
      <View className="flex-1 justify-center items-center bg-white rounded-2xl p-6 border border-slate-200 border-dashed">
        <Text className="text-4xl mb-3">📦</Text>
        <Text className="text-lg font-bold text-slate-800 text-center">
          Daftar Master Barang (V1)
        </Text>
        <Text className="text-sm text-slate-500 text-center mt-2 px-4 leading-relaxed">
          Tabel `products` SQLite siap menampung data (Nama, Kategori, Harga, Foto, Barcode). CRUD Produk akan diimplementasikan pada Fase 2.
        </Text>
        <View className="mt-4 bg-slate-100 px-4 py-2 rounded-lg">
          <Text className="text-xs text-slate-600 font-medium">
            Total Produk Tersimpan: {products.length} item
          </Text>
        </View>
      </View>
    </View>
  );
}
