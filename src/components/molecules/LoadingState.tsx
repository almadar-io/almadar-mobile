import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
}) => {
  return (
    <VStack align="center" justify="center" spacing={16} style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Typography variant="body" color="#6b7280">
        {message}
      </Typography>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    minHeight: 200,
  },
});

LoadingState.displayName = 'LoadingState';
