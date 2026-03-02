import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from '../atoms/Typography';
import { useTheme } from '../../providers/ThemeContext';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface FormSectionHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({
  title,
  subtitle,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Typography 
        variant="h4" 
        style={{ color: theme.colors.foreground }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography 
          variant="caption" 
          style={[styles.subtitle, { color: theme.colors['muted-foreground'] }]}
        >
          {subtitle}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 4,
  },
});

FormSectionHeader.displayName = 'FormSectionHeader';
