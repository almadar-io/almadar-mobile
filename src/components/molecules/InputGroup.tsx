import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { VStack } from '../atoms/Stack';
import { Label } from '../atoms/Label';
import { Typography } from '../atoms/Typography';
import { useTheme } from '../../providers/ThemeContext';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface InputGroupProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  required = false,
  helperText,
  errorMessage,
  children,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, style as ViewStyle]}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style as never]}>
        <ErrorState message={(error as Error).message} />
      </View>
    );
  }

  const errorText = (error as Error | null)?.message || errorMessage;

  return (
    <VStack spacing={4} style={[styles.container, style as ViewStyle]}>
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}
      {children}
      {errorText ? (
        <Typography 
          variant="caption" 
          style={{ color: theme.colors.error }}
        >
          {errorText}
        </Typography>
      ) : helperText ? (
        <Typography 
          variant="caption" 
          style={{ color: theme.colors['muted-foreground'] }}
        >
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
});

InputGroup.displayName = 'InputGroup';
