import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { VStack } from '../atoms/Stack';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data.',
  onRetry,
}) => {
  return (
    <VStack align="center" justify="center" spacing={16} style={styles.container}>
      <Typography variant="h4" color="#ef4444">
        {title}
      </Typography>
      <Typography variant="body" color="#6b7280" align="center">
        {message}
      </Typography>
      {onRetry && (
        <Button variant="primary" onPress={onRetry}>
          Try Again
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

ErrorState.displayName = 'ErrorState';
