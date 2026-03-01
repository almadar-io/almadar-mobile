import React from 'react';
import { StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { VStack } from '../atoms/Stack';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong',
  onRetry,
}) => {
  return (
    <VStack align="center" spacing={16} style={styles.container}>
      <Typography variant="body" color="#ef4444">
        {message}
      </Typography>
      {onRetry && (
        <Button variant="secondary" onPress={onRetry}>
          Retry
        </Button>
      )}
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

ErrorState.displayName = 'ErrorState';
