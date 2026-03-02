import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  style?: ViewStyle;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  style,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        {
          backgroundColor: theme.colors.border,
          ...(orientation === 'horizontal'
            ? { height: thickness }
            : { width: thickness }),
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
    marginVertical: 8,
  },
  vertical: {
    height: '100%',
    marginHorizontal: 8,
  },
});

Divider.displayName = 'Divider';
