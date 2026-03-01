import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';
import { Card } from '../atoms/Card';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  footer,
}) => {
  return (
    <Card padding="lg">
      <VStack spacing={24}>
        {(title || description) && (
          <VStack spacing={4}>
            {title && <Typography variant="h3">{title}</Typography>}
            {description && (
              <Typography variant="body" color="#6b7280">
                {description}
              </Typography>
            )}
          </VStack>
        )}
        
        <VStack spacing={16}>
          {children}
        </VStack>

        {footer && (
          <View style={styles.footer}>
            {footer}
          </View>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
});

FormSection.displayName = 'FormSection';
