import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  children,
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
    <VStack spacing={8} style={[styles.container, style as ViewStyle]}>
      <Typography variant="h2" style={{ color: theme.colors.foreground }}>
        {title}
      </Typography>
      
      {subtitle && (
        <Typography variant="h4" style={{ color: theme.colors['muted-foreground'] }}>
          {subtitle}
        </Typography>
      )}
      
      {description && (
        <Typography variant="body" style={{ color: theme.colors['muted-foreground'] }}>
          {description}
        </Typography>
      )}
      
      {children}
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 8,
  },
});

PageHeader.displayName = 'PageHeader';
