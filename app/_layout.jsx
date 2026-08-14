import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from '../src/db/database';
import { THEME } from '../src/constants/theme';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      initDatabase();
      setDbReady(true);
    } catch (err) {
      console.error('[RootLayout] Error initializing database:', err);
      setError(err.message || 'Gagal menginisialisasi database');
    }
  }, []);

  if (error) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Database</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!dbReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Menyiapkan Database Offline...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: THEME.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="products/form"
          options={{
            headerShown: true,
            title: 'Form Produk',
            headerBackTitle: 'Kembali',
            presentation: 'modal',
            headerStyle: { backgroundColor: THEME.colors.surface },
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 17,
              color: THEME.colors.text,
            },
            headerTintColor: THEME.colors.primary,
          }}
        />
        <Stack.Screen
          name="products/scanner"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: true,
            title: 'Pembayaran',
            headerBackTitle: 'Kasir',
            headerStyle: { backgroundColor: THEME.colors.surface },
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 17,
              color: THEME.colors.text,
            },
            headerTintColor: THEME.colors.primary,
          }}
        />
        <Stack.Screen
          name="success"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.dangerLight,
    padding: THEME.spacing.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.dangerDark,
    marginBottom: THEME.spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: THEME.colors.text,
    textAlign: 'center',
  },
});
