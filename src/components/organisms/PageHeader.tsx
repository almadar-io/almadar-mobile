import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface PageHeaderAction {
  label: string;
  onPress: () => void;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: PageHeaderAction[];
  showBack?: boolean;
  onBack?: () => void;
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
  actions,
  showBack,
  onBack,
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
      <HStack spacing={8} align="center">
        {showBack && onBack && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Typography variant="h4" style={{ color: theme.colors.primary }}>
              ←
            </Typography>
          </Pressable>
        )}
        <Typography variant="h2" style={{ color: theme.colors.foreground, flex: 1 }}>
          {title}
        </Typography>
      </HStack>

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

      {actions && actions.length > 0 && (
        <HStack spacing={8} style={styles.actions}>
          {actions.map((action, index) => (
            <Button key={index} onPress={action.onPress} size="sm">
              {action.label}
            </Button>
          ))}
        </HStack>
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
  backButton: {
    padding: 4,
  },
  actions: {
    flexWrap: 'wrap',
  },
});

PageHeader.displayName = 'PageHeader';
