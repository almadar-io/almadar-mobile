import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { useEventBus } from '../../hooks/useEventBus';
import { Toast, ToastVariant } from '../molecules/Toast';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import type { BusEventListener, EventKey, EventPayload } from '../../types';

export interface ToastItem {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  dismissAction?: EventKey;
  actionPayload?: EventPayload;
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
  showEvent?: EventKey;
  /** Event name to listen for dismiss commands */
  dismissEvent?: EventKey;
  /** Event name to listen for clear all commands */
  clearEvent?: EventKey;
}

/** Payload wraps the toast under a `toast` key instead of sending it bare. */
function isToastWrapper(value: EventPayload): value is EventPayload & { toast: EventPayload } {
  return typeof value.toast === 'object' && value.toast !== null && !Array.isArray(value.toast);
}

/** Load-bearing field check — the rest of `ToastItem` is optional. */
function isToastPayload(value: EventPayload): value is EventPayload & ToastItem {
  return typeof value.message === 'string';
}

/** `{toastId}` (direct) or `{payload: toastId}` (bus-relayed) dismiss forms. */
function extractDismissToastId(value: EventPayload): string | undefined {
  if (typeof value.toastId === 'string') return value.toastId;
  if (typeof value.payload === 'string') return value.payload;
  return undefined;
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
    const handleShow: BusEventListener = (event) => {
      const payload = event.payload;
      if (!payload) return;
      const toastData = isToastWrapper(payload) ? payload.toast : payload;
      if (isToastPayload(toastData)) {
        showToast(toastData);
      }
    };

    const handleDismiss: BusEventListener = (event) => {
      const payload = event.payload;
      if (!payload) return;
      const toastId = extractDismissToastId(payload);
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
