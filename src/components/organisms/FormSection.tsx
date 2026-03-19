import React, { useState } from 'react';
import { View, Pressable, LayoutAnimation, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { VStack, HStack } from '../atoms/Stack';
import { Card } from '../atoms/Card';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  footer,
  collapsible = false,
  defaultOpen = true,
  style,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    if (!collapsible) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(prev => !prev);
  };

  return (
    <Card padding="lg" style={style}>
      <VStack spacing={24}>
        {(title || description) && (
          <Pressable onPress={collapsible ? handleToggle : undefined} disabled={!collapsible}>
            <HStack spacing={8} align="center">
              <VStack spacing={4} style={styles.headerText}>
                {title && <Typography variant="h3">{title}</Typography>}
                {description && (
                  <Typography variant="body" color={theme.colors['muted-foreground']}>
                    {description}
                  </Typography>
                )}
              </VStack>
              {collapsible && (
                <Icon
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors['muted-foreground']}
                />
              )}
            </HStack>
          </Pressable>
        )}

        {isOpen && (
          <VStack spacing={16}>
            {children}
          </VStack>
        )}

        {isOpen && footer && (
          <View style={styles.footer}>
            {footer}
          </View>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  headerText: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
});

FormSection.displayName = 'FormSection';
