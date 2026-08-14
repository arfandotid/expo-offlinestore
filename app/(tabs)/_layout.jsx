import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet, Platform } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function TabsLayout() {
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
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
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
          tabBarIcon: ({ focused }) => (
            <Text style={styles.tabIcon}>{focused ? '🛒' : '🛍️'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Kelola Barang',
          tabBarLabel: 'Kelola Barang',
          tabBarIcon: ({ focused }) => (
            <Text style={styles.tabIcon}>{focused ? '📦' : '📋'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
});
