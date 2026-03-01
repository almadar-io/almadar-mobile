import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal as RNModal,
  ModalProps as RNModalProps,
} from 'react-native';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { VStack, HStack } from '../atoms/Stack';
import { Card } from '../atoms/Card';

export interface ModalProps extends Omit<RNModalProps, 'visible'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  size = 'md',
  animationType = 'slide',
  transparent = true,
  ...modalProps
}) => {
  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <RNModal
      visible={isOpen}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={onClose}
      {...modalProps}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <View style={styles.centeredView}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <Card style={[styles.modalCard, styles[size]]}>
              <VStack spacing={16}>
                {/* Header */}
                {title && (
                  <HStack justify="space-between" align="center">
                    <Typography variant="h4">{title}</Typography>
                    {showCloseButton && (
                      <TouchableOpacity onPress={onClose}>
                        <Typography variant="body" color="#6b7280">✕</Typography>
                      </TouchableOpacity>
                    )}
                  </HStack>
                )}

                {/* Content */}
                <View>{children}</View>

                {/* Footer */}
                {footer && (
                  <HStack spacing={8} justify="flex-end">
                    {footer}
                  </HStack>
                )}
              </VStack>
            </Card>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
  },
  sm: {
    maxWidth: 320,
  },
  md: {
    maxWidth: 400,
  },
  lg: {
    maxWidth: 520,
  },
});

Modal.displayName = 'Modal';

// Convenience export for common modal patterns
export const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onPress={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onPress={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Typography variant="body">{message}</Typography>
    </Modal>
  );
};

ConfirmModal.displayName = 'ConfirmModal';
