import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useTheme } from '../theme/ThemeProvider';

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionText,
  onAction,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const resolvedIcon = icon ?? <Package size={36} color={colors.primary} />;

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>{resolvedIcon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.8}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: THEME.spacing.xxl * 2,
    paddingHorizontal: THEME.spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    backgroundColor: colors.primarySoft,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: THEME.spacing.xl,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    ...THEME.shadow.card,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
