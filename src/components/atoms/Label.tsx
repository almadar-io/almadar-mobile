import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  style?: TextStyle;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Label: React.FC<LabelProps> = ({
  children,
  required = false,
  disabled = false,
  style,
}) => {
  const theme = useTheme();

  return (
    <Text
      style={[
        styles.label,
        {
          color: disabled 
            ? theme.colors['muted-foreground'] 
            : theme.colors.foreground,
        },
        style,
      ]}
    >
      {children}
      {required && (
        <Text style={[styles.required, { color: theme.colors.error }]}>
          {' *'}
        </Text>
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  required: {
    fontWeight: '400',
  },
});

Label.displayName = 'Label';
