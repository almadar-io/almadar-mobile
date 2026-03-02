import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export interface FormFieldDefinition {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    message?: string;
  };
}

export interface FormAction {
  label: string;
  event?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  navigatesTo?: string;
}

export interface FormProps {
  title?: string;
  description?: string;
  fields: FormFieldDefinition[];
  values?: Record<string, string | number | boolean>;
  errors?: Record<string, string>;
  onSubmit?: (values: Record<string, string | number | boolean>) => void;
  onChange?: (name: string, value: string | number | boolean) => void;
  submitLabel?: string;
  actions?: FormAction[];
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Render prop for custom field rendering */
  renderField?: (field: FormFieldDefinition, value: unknown, error: string | undefined) => React.ReactNode;
}

export const Form: React.FC<FormProps> = ({
  title,
  description,
  fields,
  values = {},
  errors = {},
  onSubmit,
  onChange,
  submitLabel = 'Submit',
  actions,
  style,
  isLoading,
  error,
  entity,
  renderField,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [formValues, setFormValues] = React.useState<Record<string, string | number | boolean>>(values);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(errors);

  React.useEffect(() => {
    setFormValues(values);
  }, [values]);

  React.useEffect(() => {
    setFormErrors(errors);
  }, [errors]);

  const validateField = (field: FormFieldDefinition, value: unknown): string | undefined => {
    if (field.required && (value === undefined || value === '' || value === null)) {
      return `${field.label} is required`;
    }

    if (field.validation && value !== undefined && value !== '') {
      const stringValue = String(value);

      if (field.validation.minLength !== undefined && stringValue.length < field.validation.minLength) {
        return field.validation.message || `${field.label} must be at least ${field.validation.minLength} characters`;
      }

      if (field.validation.maxLength !== undefined && stringValue.length > field.validation.maxLength) {
        return field.validation.message || `${field.label} must be at most ${field.validation.maxLength} characters`;
      }

      if (field.validation.pattern && !field.validation.pattern.test(stringValue)) {
        return field.validation.message || `${field.label} format is invalid`;
      }

      if (field.type === 'number') {
        const numValue = Number(value);
        if (field.validation.min !== undefined && numValue < field.validation.min) {
          return field.validation.message || `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation.max !== undefined && numValue > field.validation.max) {
          return field.validation.message || `${field.label} must be at most ${field.validation.max}`;
        }
      }
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const errorMessage = validateField(field, formValues[field.name]);
      if (errorMessage) {
        newErrors[field.name] = errorMessage;
        isValid = false;
      }
    });

    setFormErrors(newErrors);
    return isValid;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange = (name: string, value: string | number | boolean) => {
    const newValues = { ...formValues, [name]: value };
    setFormValues(newValues);

    // Clear error for this field when user changes it
    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }

    eventBus.emit('UI:FORM_FIELD_CHANGE', { field: name, value, entity });
    onChange?.(name, value);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      eventBus.emit('UI:FORM_VALIDATION_ERROR', { errors: formErrors, entity });
      return;
    }

    eventBus.emit('UI:FORM_SUBMIT', { values: formValues, entity });
    onSubmit?.(formValues);
  };

  const handleAction = (action: FormAction) => {
    if (action.event) {
      eventBus.emit(`UI:${action.event}`, { values: formValues, entity, navigatesTo: action.navigatesTo });
    }
  };

  const renderDefaultField = (field: FormFieldDefinition): React.ReactNode => {
    const value = formValues[field.name];
    const fieldError = formErrors[field.name];

    if (renderField) {
      return renderField(field, value, fieldError);
    }

    const baseInputStyle = {
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: theme.typography.sizes.base,
      backgroundColor: theme.colors.card,
      borderColor: fieldError ? theme.colors.error : theme.colors.border,
      color: theme.colors.foreground,
    };

    switch (field.type) {
      case 'select':
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Typography variant="label" style={{ marginBottom: 4 }}>
              {field.label}
              {field.required && (
                <Typography variant="label" style={{ color: theme.colors.error }}> *</Typography>
              )}
            </Typography>
            <View style={[baseInputStyle, { padding: 0 }]}>
              {/* Select implementation would go here - using native select or custom dropdown */}
              <Typography variant="body" style={{ color: theme.colors.foreground }}>
                Select placeholder
              </Typography>
            </View>
            {fieldError && (
              <Typography variant="caption" style={{ color: theme.colors.error, marginTop: 4 }}>
                {fieldError}
              </Typography>
            )}
          </View>
        );

      case 'checkbox':
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <HStack spacing={8} align="center">
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 1,
                  borderRadius: 4,
                  borderColor: fieldError ? theme.colors.error : theme.colors.border,
                  backgroundColor: value ? theme.colors.primary : theme.colors.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {value && (
                  <Typography variant="caption" style={{ color: theme.colors['primary-foreground'] }}>
                    ✓
                  </Typography>
                )}
              </View>
              <Typography variant="body">
                {field.label}
                {field.required && (
                  <Typography variant="body" style={{ color: theme.colors.error }}> *</Typography>
                )}
              </Typography>
            </HStack>
            {fieldError && (
              <Typography variant="caption" style={{ color: theme.colors.error, marginTop: 4 }}>
                {fieldError}
              </Typography>
            )}
          </View>
        );

      case 'radio':
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Typography variant="label" style={{ marginBottom: 4 }}>
              {field.label}
              {field.required && (
                <Typography variant="label" style={{ color: theme.colors.error }}> *</Typography>
              )}
            </Typography>
            <VStack spacing={8}>
              {field.options?.map((option) => (
                <HStack key={option.value} spacing={8} align="center">
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 1,
                      borderRadius: 10,
                      borderColor: fieldError ? theme.colors.error : theme.colors.border,
                      backgroundColor: value === option.value ? theme.colors.primary : theme.colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {value === option.value && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: theme.colors['primary-foreground'],
                        }}
                      />
                    )}
                  </View>
                  <Typography variant="body">{option.label}</Typography>
                </HStack>
              ))}
            </VStack>
            {fieldError && (
              <Typography variant="caption" style={{ color: theme.colors.error, marginTop: 4 }}>
                {fieldError}
              </Typography>
            )}
          </View>
        );

      case 'textarea':
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Typography variant="label" style={{ marginBottom: 4 }}>
              {field.label}
              {field.required && (
                <Typography variant="label" style={{ color: theme.colors.error }}> *</Typography>
              )}
            </Typography>
            <View
              style={[
                baseInputStyle,
                { height: 100 },
              ]}
            >
              <Typography variant="body" style={{ color: theme.colors.foreground }}>
                {String(value || '')}
              </Typography>
            </View>
            {fieldError && (
              <Typography variant="caption" style={{ color: theme.colors.error, marginTop: 4 }}>
                {fieldError}
              </Typography>
            )}
          </View>
        );

      default:
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Typography variant="label" style={{ marginBottom: 4 }}>
              {field.label}
              {field.required && (
                <Typography variant="label" style={{ color: theme.colors.error }}> *</Typography>
              )}
            </Typography>
            {/* Note: This is a placeholder representation. In a real implementation,
                use the Input component with onChangeText={(text) => handleChange(field.name, text)} */}
            <View style={baseInputStyle}>
              <Typography variant="body" style={{ color: theme.colors.foreground }}>
                {String(value || field.placeholder || '')}
              </Typography>
            </View>
            {fieldError && (
              <Typography variant="caption" style={{ color: theme.colors.error, marginTop: 4 }}>
                {fieldError}
              </Typography>
            )}
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading form..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  if (fields.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <EmptyState message="No form fields defined" />
      </View>
    );
  }

  return (
    <Card style={[styles.container, style as ViewStyle]} padding="lg">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack spacing={24}>
          {(title || description) && (
            <VStack spacing={4}>
              {title && (
                <Typography variant="h3" style={{ color: theme.colors.foreground }}>
                  {title}
                </Typography>
              )}
              {description && (
                <Typography variant="body" style={{ color: theme.colors['muted-foreground'] }}>
                  {description}
                </Typography>
              )}
            </VStack>
          )}

          <VStack spacing={16}>
            {fields.map((field) => renderDefaultField(field))}
          </VStack>

          <HStack spacing={12} justify="flex-end">
            {actions?.map((action, index) => (
              <Button
                key={`${action.label}-${index}`}
                variant={action.variant || 'default'}
                onPress={() => handleAction(action)}
                action={action.event}
              >
                {action.label}
              </Button>
            ))}
            <Button variant="primary" onPress={handleSubmit} action="FORM_SUBMIT">
              {submitLabel}
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  fieldContainer: {
    width: '100%',
  },
});

Form.displayName = 'Form';
