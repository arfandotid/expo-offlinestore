import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from '../src/db/database';

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
        <View className="flex-1 justify-center items-center bg-red-50 p-6">
          <Text className="text-xl font-bold text-red-600 mb-2">Error Database</Text>
          <Text className="text-gray-700 text-center">{error}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!dbReady) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 justify-center items-center bg-slate-50">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-4 text-slate-600 font-medium">Menyiapkan Database Offline...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
