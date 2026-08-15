import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

/**
 * Baris chip filter kategori (horizontal, scrollable).
 * Props: categories (string[]), selected (string | null), onSelect (fn)
 */
export default function CategoryFilter({ categories = [], selected = null, onSelect }) {
  const chips = [{ key: null, label: 'Semua' }, ...categories.map((c) => ({ key: c, label: c }))];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map(({ key, label }) => {
        const isActive = selected === key;
        return (
          <TouchableOpacity
            key={key || 'all'}
            activeOpacity={0.8}
            onPress={() => onSelect(key)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
    gap: THEME.spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    maxWidth: 160,
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
