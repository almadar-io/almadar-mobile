import React, { useCallback } from 'react';
import { 
  Modal as RNModal, 
  View, 
  TouchableOpacity, 
  StyleSheet,
  ViewStyle
} from 'react-native';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  animationType = 'fade',
  ...modalProps
}) => {
  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdrop) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  const transparent = animationType !== 'slide';

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
            <Card style={[styles.modalCard, styles[size] as ViewStyle]}>
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
                  <HStack justify="flex-end" spacing={12}>
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
    maxWidth: 400,
  },
  sm: {
    maxWidth: 300,
  },
  md: {
    maxWidth: 400,
  },
  lg: {
    maxWidth: 600,
  },
});

Modal.displayName = 'Modal';

// Confirm Modal
export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Typography variant="body" color="#6b7280" onPress={onClose}>
            {cancelLabel}
          </Typography>
          <Typography variant="body" color="#ef4444" onPress={onConfirm}>
            {confirmLabel}
          </Typography>
        </>
      }
    >
      <Typography variant="body">{message}</Typography>
    </Modal>
  );
};

ConfirmModal.displayName = 'ConfirmModal';
