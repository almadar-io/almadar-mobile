import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { Badge } from '../atoms/Badge';

export interface EntityCardProps {
  title: string;
  subtitle?: string;
  status?: string;
  statusVariant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  metadata?: Array<{ label: string; value: string }>;
  onPress?: () => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  status,
  statusVariant = 'default',
  metadata,
  onPress,
}) => {
  return (
    <Card onPress={onPress} padding="md" style={styles.card}>
      <VStack spacing={12}>
        <HStack justify="space-between" align="flex-start">
          <VStack spacing={4} style={styles.titleSection}>
            <Typography variant="h4">{title}</Typography>
            {subtitle && (
              <Typography variant="body-small" color="#6b7280">
                {subtitle}
              </Typography>
            )}
          </VStack>
          {status && (
            <Badge variant={statusVariant} size="sm">
              {status}
            </Badge>
          )}
        </HStack>

        {metadata && metadata.length > 0 && (
          <VStack spacing={8} style={styles.metadata}>
            {metadata.map((item, index) => (
              <HStack key={index} justify="space-between">
                <Typography variant="caption" color="#6b7280">
                  {item.label}
                </Typography>
                <Typography variant="caption">
                  {item.value}
                </Typography>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  metadata: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
});

EntityCard.displayName = 'EntityCard';
