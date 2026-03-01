import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
}) => {
  return (
    <VStack align="center" spacing={12} style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Typography variant="body" color="#6b7280">
        {message}
      </Typography>
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

LoadingState.displayName = 'LoadingState';
