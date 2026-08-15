import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings as SettingsIcon } from 'lucide-react-native';
import { THEME } from '../constants/theme';

/**
 * Aksi di sisi kanan navbar tab.
 * Menerima `children` sebagai ikon-ikon aksi kiri (search/scan),
 * lalu selalu menampilkan ikon gear pengaturan di paling kanan.
 */
export default function HeaderActions({ children }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {children}
      <TouchableOpacity
        onPress={() => router.push('/settings')}
        style={styles.actionBtn}
        hitSlop={8}
      >
        <SettingsIcon size={22} color={THEME.colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  actionBtn: {
    padding: 6,
    marginLeft: THEME.spacing.xs,
  },
});
