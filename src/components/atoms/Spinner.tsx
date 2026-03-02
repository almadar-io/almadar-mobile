import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color,
  style,
}) => {
  const theme = useTheme();

  const sizeMap: Record<string, number> = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        size={sizeMap[size]}
        color={color || theme.colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

Spinner.displayName = 'Spinner';
