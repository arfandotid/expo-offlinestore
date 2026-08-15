import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Baris chip filter kategori (horizontal, scrollable).
 * Props: categories (string[]), selected (string | null), onSelect (fn)
 */
export default function CategoryFilter({ categories = [], selected = null, onSelect }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

const createStyles = (colors) => StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
    gap: THEME.spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 160,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
