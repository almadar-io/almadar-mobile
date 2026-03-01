import React from 'react';
import { StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

export interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No data available',
  icon,
}) => {
  return (
    <VStack align="center" spacing={12} style={styles.container}>
      {icon}
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

EmptyState.displayName = 'EmptyState';
