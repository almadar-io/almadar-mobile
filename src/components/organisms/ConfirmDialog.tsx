import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Modal, ModalProps } from '../molecules/Modal';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { Card } from '../atoms/Card';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'default';

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Callback when dialog is closed */
  onClose: () => void;

  /** Callback when action is confirmed */
  onConfirm: () => void;

  /** Dialog title */
  title: string;

  /** Dialog message/description */
  message?: string;

  /** Alias for message (schema compatibility) */
  description?: string;

  /** Confirm button text */
  confirmText?: string;

  /** Alias for confirmText (schema compatibility) */
  confirmLabel?: string;

  /** Cancel button text */
  cancelText?: string;

  /** Alias for cancelText (schema compatibility) */
  cancelLabel?: string;

  /** Dialog variant */
  variant?: ConfirmDialogVariant;

  /** Modal size */
  size?: ModalProps['size'];

  /** Loading state for confirm button */
  isLoading?: boolean;

  /** Error state */
  error?: Error | null;

  /** Entity name for schema-driven auto-fetch */
  entity?: string;

  /** Additional style for the dialog */
  style?: ViewStyle;

  /** Declarative confirm event - emits UI:{confirmEvent} via eventBus when confirmed */
  confirmEvent?: string;

  /** Declarative cancel event - emits UI:{cancelEvent} via eventBus when cancelled */
  cancelEvent?: string;

  /** Declarative close event - emits UI:{closeEvent} via eventBus when closed */
  closeEvent?: string;
}

const variantConfig = {
  danger: {
    icon: '⚠️',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    confirmVariant: 'destructive' as const,
  },
  warning: {
    icon: '⚡',
    iconBg: '#fef3c7',
    iconColor: '#ca8a04',
    confirmVariant: 'primary' as const,
  },
  info: {
    icon: 'ℹ️',
    iconBg: '#dbeafe',
    iconColor: '#0ea5e9',
    confirmVariant: 'primary' as const,
  },
  default: {
    icon: '✓',
    iconBg: '#d1fae5',
    iconColor: '#16a34a',
    confirmVariant: 'primary' as const,
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant = 'default',
  size = 'sm',
  isLoading = false,
  error,
  style,
  confirmEvent,
  cancelEvent,
  closeEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const config = variantConfig[variant];

  // Resolve aliases
  const resolvedMessage = message ?? description ?? 'Are you sure you want to proceed?';
  const resolvedConfirmText = confirmText ?? confirmLabel ?? 'Confirm';
  const resolvedCancelText = cancelText ?? cancelLabel ?? 'Cancel';

  const handleConfirm = () => {
    if (confirmEvent) {
      eventBus.emit(`UI:${confirmEvent}`, {});
    }
    onConfirm();
  };

  const handleCancel = () => {
    if (cancelEvent) {
      eventBus.emit(`UI:${cancelEvent}`, {});
    }
    onClose();
  };

  const handleClose = () => {
    if (closeEvent) {
      eventBus.emit(`UI:${closeEvent}`, {});
    }
    onClose();
  };

  const footer = (
    <HStack justify="flex-end" spacing={12}>
      <Button
        variant="secondary"
        onPress={handleCancel}
        disabled={isLoading}
        action={cancelEvent}
      >
        {resolvedCancelText}
      </Button>
      <Button
        variant={config.confirmVariant}
        onPress={handleConfirm}
        isLoading={isLoading}
        disabled={isLoading}
        action={confirmEvent}
      >
        {resolvedConfirmText}
      </Button>
    </HStack>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size={size}
      showCloseButton={false}
      closeOnBackdrop={!isLoading}
      footer={footer}
    >
      <View style={[styles.container, style]}>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} onRetry={handleConfirm} />
        ) : (
          <HStack spacing={16} align="flex-start">
            {/* Icon */}
            <Card
              style={[
                styles.iconContainer,
                { backgroundColor: config.iconBg },
              ]}
              padding="md"
            >
              <Typography variant="h4" style={{ color: config.iconColor }}>
                {config.icon}
              </Typography>
            </Card>

            {/* Content */}
            <VStack spacing={4} style={styles.content}>
              <Typography variant="h4">{title}</Typography>
              <Typography variant="body" color={theme.colors['muted-foreground']}>
                {resolvedMessage}
              </Typography>
            </VStack>
          </HStack>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  content: {
    flex: 1,
  },
});

ConfirmDialog.displayName = 'ConfirmDialog';
