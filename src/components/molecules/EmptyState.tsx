import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { VStack } from '../atoms/Stack';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  message = 'Get started by creating your first item.',
  actionLabel,
  onAction,
}) => {
  return (
    <VStack align="center" justify="center" spacing={12} style={styles.container}>
      <Typography variant="h4" color="#374151">
        {title}
      </Typography>
      <Typography variant="body" color="#6b7280" align="center">
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    minHeight: 200,
  },
});

EmptyState.displayName = 'EmptyState';
