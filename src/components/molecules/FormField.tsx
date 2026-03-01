import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  children,
  style,
}) => {
  return (
    <VStack spacing={6} style={[styles.container, style as ViewStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Typography variant="label">
            {label}
            {required && <Typography variant="label" color="#ef4444"> *</Typography>}
          </Typography>
        </View>
      )}
      
      {children}
      
      {error ? (
        <Typography variant="caption" color="#ef4444">
          {error}
        </Typography>
      ) : helperText ? (
        <Typography variant="caption" color="#6b7280">
          {helperText}
        </Typography>
      ) : null}
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    marginBottom: 4,
  },
});

FormField.displayName = 'FormField';
