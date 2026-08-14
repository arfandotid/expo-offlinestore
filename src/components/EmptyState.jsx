import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export default function EmptyState({
  icon = <Package size={36} color={THEME.colors.primary} />,
  title,
  subtitle,
  actionText,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>{icon}</View>
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

const styles = StyleSheet.create({
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
    backgroundColor: THEME.colors.primarySoft,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: THEME.spacing.xl,
  },
  actionButton: {
    backgroundColor: THEME.colors.primary,
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
