import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingCart, Package, Receipt } from 'lucide-react-native';
import { THEME } from '../../src/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? insets.bottom : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: THEME.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: THEME.colors.borderLight,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: THEME.colors.text,
        },
        tabBarStyle: {
          backgroundColor: THEME.colors.surface,
          borderTopColor: THEME.colors.border,
          borderTopWidth: 1,
          height: (Platform.OS === 'ios' ? 88 : 64) + bottomInset,
          paddingBottom: (Platform.OS === 'ios' ? 28 : 10) + bottomInset,
          paddingTop: 8,
        },
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Penjualan',
          tabBarLabel: 'Penjualan',
          tabBarIcon: ({ color, focused }) => (
            <ShoppingCart size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Kelola Barang',
          tabBarLabel: 'Kelola Barang',
          tabBarIcon: ({ color, focused }) => (
            <Package size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat Transaksi',
          tabBarLabel: 'Riwayat',
          tabBarIcon: ({ color, focused }) => (
            <Receipt size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
