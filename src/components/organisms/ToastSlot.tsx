import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { useEventBus } from '../../hooks/useEventBus';
import { Toast, ToastVariant } from '../molecules/Toast';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface ToastItem {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  dismissAction?: string;
  actionPayload?: Record<string, unknown>;
}

interface KFlowEvent {
  type: string;
  payload?: Record<string, unknown>;
  timestamp: number;
  source?: string;
}

export interface ToastSlotProps {
  style?: ViewStyle;
  position?: 'top' | 'bottom' | 'center';
  maxToasts?: number;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event name to listen for show commands */
  showEvent?: string;
  /** Event name to listen for dismiss commands */
  dismissEvent?: string;
  /** Event name to listen for clear all commands */
  clearEvent?: string;
}

export const ToastSlot: React.FC<ToastSlotProps> = ({
  style,
  position = 'top',
  maxToasts = 5,
  isLoading,
  error,
  entity,
  showEvent = 'UI:TOAST_SHOW',
  dismissEvent = 'UI:TOAST_DISMISS',
  clearEvent = 'UI:TOAST_CLEAR',
}) => {
  const eventBus = useEventBus();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((toast: ToastItem | { toast: ToastItem }) => {
    const toastItem = 'toast' in toast ? toast.toast : toast;
    const newToast: ToastItem = {
      ...toastItem,
      id: toastItem.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });
  }, [maxToasts]);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  useEffect(() => {
    const handleShow = (event: KFlowEvent) => {
      const payload = event.payload;
      if (!payload) return;
      const showPayload = payload as ToastItem | { toast: ToastItem };
      showToast(showPayload);
    };

    const handleDismiss = (event: KFlowEvent) => {
      const payload = event.payload;
      if (!payload) return;
      const dismissPayload = payload as { toastId: string } | { payload: string };
      const toastId = 'toastId' in dismissPayload 
        ? dismissPayload.toastId 
        : ('payload' in dismissPayload ? dismissPayload.payload : undefined);
      if (typeof toastId === 'string') {
        dismissToast(toastId);
      }
    };

    const handleClear = () => {
      clearAllToasts();
    };

    const unsubscribeShow = eventBus.on(showEvent, handleShow);
    const unsubscribeDismiss = eventBus.on(dismissEvent, handleDismiss);
    const unsubscribeClear = eventBus.on(clearEvent, handleClear);

    return () => {
      unsubscribeShow();
      unsubscribeDismiss();
      unsubscribeClear();
    };
  }, [eventBus, showEvent, dismissEvent, clearEvent, showToast, dismissToast, clearAllToasts]);

  const handleDismiss = useCallback((id: string) => {
    dismissToast(id);
  }, [dismissToast]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles[position], style]}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles[position], style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, styles[position], style]} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          onDismiss={handleDismiss}
          dismissAction={toast.dismissAction}
          actionPayload={{
            entity,
            ...toast.actionPayload,
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    pointerEvents: 'box-none',
  },
  top: {
    top: 0,
    paddingTop: 44, // iOS status bar height
  },
  bottom: {
    bottom: 0,
    paddingBottom: 34, // iOS home indicator height
  },
  center: {
    top: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

ToastSlot.displayName = 'ToastSlot';
