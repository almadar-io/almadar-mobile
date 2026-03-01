import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { Badge } from '../atoms/Badge';

export interface DetailField {
  label: string;
  value: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export interface DetailPanelProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  fields: DetailField[];
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  title,
  subtitle,
  status,
  fields,
}) => {
  return (
    <ScrollView style={styles.container}>
      <Card padding="lg">
        <VStack spacing={24}>
          {/* Header */}
          <VStack spacing={8}>
            <HStack justify="space-between" align="center">
              <Typography variant="h2" style={styles.title}>
                {title}
              </Typography>
              {status && (
                <Badge variant={status.variant} size="md">
                  {status.label}
                </Badge>
              )}
            </HStack>
            {subtitle && (
              <Typography variant="body" color="#6b7280">
                {subtitle}
              </Typography>
            )}
          </VStack>

          {/* Fields */}
          <VStack spacing={16}>
            {fields.map((field, index) => (
              <View 
                key={index} 
                style={[
                  styles.field,
                  index < fields.length - 1 && styles.fieldBorder
                ]}
              >
                <Typography variant="caption" color="#6b7280">
                  {field.label}
                </Typography>
                <Badge variant={field.variant || 'default'} size="sm">
                  {field.value}
                </Badge>
              </View>
            ))}
          </VStack>
        </VStack>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    flex: 1,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  fieldBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
});

DetailPanel.displayName = 'DetailPanel';
