import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { useEventBus } from '../../hooks/useEventBus';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';
import { HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import type { BusEventListener, EventKey, EventPayload } from '../../types';

export interface ModalAction {
  label: string;
  event?: EventKey;
  navigatesTo?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  payload?: EventPayload;
}

export interface ModalContent {
  id: string;
  title?: string;
  content: React.ReactNode;
  actions?: ModalAction[];
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

export interface ModalSlotProps {
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Default size for modals */
  defaultSize?: 'sm' | 'md' | 'lg';
  /** Event name to listen for open commands */
  openEvent?: EventKey;
  /** Event name to listen for close commands */
  closeEvent?: EventKey;
}

/** Payload wraps the modal under a `modal` key instead of sending it bare. */
function isModalWrapper(value: EventPayload): value is EventPayload & { modal: EventPayload } {
  return typeof value.modal === 'object' && value.modal !== null && !Array.isArray(value.modal);
}

/**
 * Load-bearing field check (`id`); `content` is a live React node — outside
 * `EventPayload`'s JSON contract by design (the bus carries it in-process,
 * never serialized), so it's narrowed with one bounded cast rather than
 * reconstructed field-by-field like the rest.
 */
function toModalContent(value: EventPayload): ModalContent | null {
  if (typeof value.id !== 'string') return null;
  return {
    id: value.id,
    title: typeof value.title === 'string' ? value.title : undefined,
    content: value.content as React.ReactNode,
    actions: Array.isArray(value.actions) ? (value.actions as ModalAction[]) : undefined,
    size: value.size === 'sm' || value.size === 'md' || value.size === 'lg' ? value.size : undefined,
    closeOnBackdrop: typeof value.closeOnBackdrop === 'boolean' ? value.closeOnBackdrop : undefined,
    showCloseButton: typeof value.showCloseButton === 'boolean' ? value.showCloseButton : undefined,
  };
}

export const ModalSlot: React.FC<ModalSlotProps> = ({
  style,
  isLoading,
  error,
  entity,
  defaultSize = 'md',
  openEvent = 'UI:MODAL_OPEN',
  closeEvent = 'UI:MODAL_CLOSE',
}) => {
  const eventBus = useEventBus();
  const [, setModalQueue] = useState<ModalContent[]>([]);
  const [currentModal, setCurrentModal] = useState<ModalContent | null>(null);

  const openModal = useCallback((modalContent: ModalContent) => {
    setModalQueue((prev) => [...prev, modalContent]);
    if (!currentModal) {
      setCurrentModal(modalContent);
    }
  }, [currentModal]);

  const closeModal = useCallback(() => {
    setCurrentModal((prev) => {
      if (prev) {
        setModalQueue((queue) => {
          const newQueue = queue.filter((m) => m.id !== prev.id);
          if (newQueue.length > 0) {
            setTimeout(() => setCurrentModal(newQueue[0]), 0);
          }
          return newQueue;
        });
      }
      return null;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModalQueue([]);
    setCurrentModal(null);
  }, []);

  useEffect(() => {
    const handleOpen: BusEventListener = (event) => {
      const payload = event.payload;
      if (!payload) return;
      const modalPayload = isModalWrapper(payload) ? payload.modal : payload;
      const modal = toModalContent(modalPayload);
      if (!modal) return;
      openModal({
        ...modal,
        size: modal.size || defaultSize,
      });
    };

    const handleClose: BusEventListener = (event) => {
      const payload = event.payload;
      const closePayload = payload as { modalId?: string; all?: boolean } | undefined;
      if (closePayload?.all) {
        closeAllModals();
      } else if (closePayload?.modalId) {
        setModalQueue((prev) => prev.filter((m) => m.id !== closePayload.modalId));
        if (currentModal?.id === closePayload.modalId) {
          closeModal();
        }
      } else {
        closeModal();
      }
    };

    const unsubscribeOpen = eventBus.on(openEvent, handleOpen);
    const unsubscribeClose = eventBus.on(closeEvent, handleClose);

    return () => {
      unsubscribeOpen();
      unsubscribeClose();
    };
  }, [eventBus, openEvent, closeEvent, openModal, closeModal, closeAllModals, currentModal, defaultSize]);

  const handleAction = useCallback((action: ModalAction) => {
    if (action.event) {
      eventBus.emit(`UI:${action.event}`, {
        modalId: currentModal?.id,
        entity,
        ...action.payload,
      });
    }
    if (action.navigatesTo) {
      eventBus.emit('UI:NAVIGATE', {
        to: action.navigatesTo,
        modalId: currentModal?.id,
        entity,
        ...action.payload,
      });
    }
  }, [currentModal, entity, eventBus]);

  const renderFooter = () => {
    if (!currentModal?.actions || currentModal.actions.length === 0) {
      return undefined;
    }

    return (
      <HStack spacing={12} justify="flex-end">
        {currentModal.actions.map((action, index) => (
          <Button
            key={`${action.label}-${index}`}
            variant={action.variant || 'default'}
            action={action.event}
            actionPayload={{
              modalId: currentModal.id,
              entity,
              ...action.payload,
            }}
            onPress={() => handleAction(action)}
          >
            {action.label}
          </Button>
        ))}
      </HStack>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading..." />
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

  return (
    <View style={style}>
      <Modal
        isOpen={!!currentModal}
        onClose={closeModal}
        title={currentModal?.title}
        size={currentModal?.size || defaultSize}
        closeOnBackdrop={currentModal?.closeOnBackdrop !== false}
        showCloseButton={currentModal?.showCloseButton !== false}
        footer={renderFooter()}
      >
        {currentModal?.content}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

ModalSlot.displayName = 'ModalSlot';
