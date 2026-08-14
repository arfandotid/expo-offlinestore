import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: '#0f172a',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#64748b',
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
            <Text style={{ fontSize: 20 }}>{focused ? '🛒' : '🛍️'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Kelola Barang',
          tabBarLabel: 'Kelola Barang',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '📦' : '📋'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
