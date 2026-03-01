import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { backgroundColor: string; color: string }> = {
  default: { backgroundColor: '#f3f4f6', color: '#374151' },
  primary: { backgroundColor: '#e0e7ff', color: '#4338ca' },
  secondary: { backgroundColor: '#e2e8f0', color: '#475569' },
  success: { backgroundColor: '#dcfce7', color: '#15803d' },
  warning: { backgroundColor: '#fef3c7', color: '#b45309' },
  error: { backgroundColor: '#fee2e2', color: '#b91c1c' },
};

const sizeStyles: Record<BadgeSize, { paddingHorizontal: number; paddingVertical: number; fontSize: number }> = {
  sm: { paddingHorizontal: 8, paddingVertical: 2, fontSize: 12 },
  md: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 14 },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View style={[
      styles.badge,
      { backgroundColor: variantStyle.backgroundColor },
      { paddingHorizontal: sizeStyle.paddingHorizontal, paddingVertical: sizeStyle.paddingVertical },
      style,
    ]}>
      <Text style={[
        styles.text,
        { color: variantStyle.color, fontSize: sizeStyle.fontSize },
      ]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
});

Badge.displayName = 'Badge';
