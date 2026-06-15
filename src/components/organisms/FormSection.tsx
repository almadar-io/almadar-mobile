import React, { useState } from 'react';
import { View, Pressable, LayoutAnimation, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { VStack, HStack } from '../atoms/Stack';
import { Card } from '../atoms/Card';

export interface FormSectionField {
  name: string;
  label?: string;
}

export interface FormSectionProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
  fields?: FormSectionField[];
  onSubmit?: () => void;
  onCancel?: () => void;
}

function fieldLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  footer,
  collapsible = false,
  defaultOpen = true,
  style,
  fields,
  onSubmit,
  onCancel,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    if (!collapsible) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(prev => !prev);
  };

  const renderFields = () => {
    if (!fields || fields.length === 0) return children;
    return (
      <>
        {fields.map((field) => (
          <Input
            key={field.name}
            label={field.label ?? fieldLabel(field.name)}
            placeholder={field.label ?? fieldLabel(field.name)}
          />
        ))}
      </>
    );
  };

  const footerContent = footer ? (
    footer
  ) : onSubmit || onCancel ? (
    <HStack spacing={8}>
      {onSubmit && (
        <Button onPress={onSubmit} variant="primary">
          Save
        </Button>
      )}
      {onCancel && (
        <Button onPress={onCancel} variant="ghost">
          Cancel
        </Button>
      )}
    </HStack>
  ) : null;

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
            {renderFields()}
          </VStack>
        )}

        {isOpen && footerContent && (
          <View style={styles.footer}>
            {footerContent}
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
