import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { Badge } from '../atoms/Badge';

export interface EntityCardProps {
  title: string;
  subtitle?: string;
  status?: string;
  statusVariant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  children?: React.ReactNode;
  onPress?: () => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  status,
  statusVariant = 'default',
  children,
  onPress,
}) => {
  return (
    <Card onPress={onPress} style={styles.card}>
      <VStack spacing={12}>
        <HStack justify="space-between" align="center">
          <VStack spacing={4}>
            <Typography variant="h4">{title}</Typography>
            {subtitle && (
              <Typography variant="caption" color="#6b7280">
                {subtitle}
              </Typography>
            )}
          </VStack>
          {status && (
            <Badge variant={statusVariant}>
              {status}
            </Badge>
          )}
        </HStack>
        
        {children}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
});

EntityCard.displayName = 'EntityCard';
