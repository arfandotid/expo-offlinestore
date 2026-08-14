import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SalesScreen() {
  return (
    <View className="flex-1 bg-slate-50 p-4">
      {/* Header status bar mini */}
      <View className="bg-emerald-500 rounded-2xl p-5 mb-4 shadow-sm">
        <Text className="text-white text-xs font-semibold uppercase tracking-wider">
          POS Mode Aktif (100% Offline)
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">
          Kasir Penjualan
        </Text>
        <Text className="text-emerald-100 text-sm mt-1">
          Siap melayani transaksi kasir
        </Text>
      </View>

      {/* Placeholder content untuk Fase 3 */}
      <View className="flex-1 justify-center items-center bg-white rounded-2xl p-6 border border-slate-200 border-dashed">
        <Text className="text-4xl mb-3">🛒</Text>
        <Text className="text-lg font-bold text-slate-800 text-center">
          Katalog Produk & Keranjang
        </Text>
        <Text className="text-sm text-slate-500 text-center mt-2 px-4 leading-relaxed">
          Fondasi Fase 1 telah aktif. Katalog penjualan dan keranjang transaksi akan diimplementasikan pada Fase 3.
        </Text>
      </View>
    </View>
  );
}
