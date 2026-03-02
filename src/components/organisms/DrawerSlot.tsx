import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { useEventBus } from '../../hooks/useEventBus';
import { Drawer } from '../molecules/Drawer';
import { Button } from '../atoms/Button';
import { HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface DrawerAction {
  label: string;
  event?: string;
  navigatesTo?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  payload?: Record<string, unknown>;
}

export interface DrawerContent {
  id: string;
  title?: string;
  content: React.ReactNode;
  actions?: DrawerAction[];
  placement?: 'left' | 'right';
  width?: number;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

interface KFlowEvent {
  type: string;
  payload?: Record<string, unknown>;
  timestamp: number;
  source?: string;
}

export interface DrawerSlotProps {
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Default placement for drawers */
  defaultPlacement?: 'left' | 'right';
  /** Default width for drawers */
  defaultWidth?: number;
  /** Event name to listen for open commands */
  openEvent?: string;
  /** Event name to listen for close commands */
  closeEvent?: string;
}

export const DrawerSlot: React.FC<DrawerSlotProps> = ({
  style,
  isLoading,
  error,
  entity,
  defaultPlacement = 'right',
  defaultWidth = 320,
  openEvent = 'UI:DRAWER_OPEN',
  closeEvent = 'UI:DRAWER_CLOSE',
}) => {
  const eventBus = useEventBus();
  const [, setDrawerQueue] = useState<DrawerContent[]>([]);
  const [currentDrawer, setCurrentDrawer] = useState<DrawerContent | null>(null);

  const openDrawer = useCallback((drawerContent: DrawerContent) => {
    setDrawerQueue((prev) => [...prev, drawerContent]);
    if (!currentDrawer) {
      setCurrentDrawer(drawerContent);
    }
  }, [currentDrawer]);

  const closeDrawer = useCallback(() => {
    setCurrentDrawer((prev) => {
      if (prev) {
        setDrawerQueue((queue) => {
          const newQueue = queue.filter((d) => d.id !== prev.id);
          if (newQueue.length > 0) {
            setTimeout(() => setCurrentDrawer(newQueue[0]), 0);
          }
          return newQueue;
        });
      }
      return null;
    });
  }, []);

  const closeAllDrawers = useCallback(() => {
    setDrawerQueue([]);
    setCurrentDrawer(null);
  }, []);

  useEffect(() => {
    const handleOpen = (event: KFlowEvent) => {
      const payload = event.payload;
      if (!payload) return;
      const drawerPayload = payload as DrawerContent | { drawer: DrawerContent };
      const drawer = 'drawer' in drawerPayload ? drawerPayload.drawer : drawerPayload;
      openDrawer({
        ...drawer,
        placement: drawer.placement || defaultPlacement,
        width: drawer.width || defaultWidth,
      });
    };

    const handleClose = (event: KFlowEvent) => {
      const payload = event.payload;
      const closePayload = payload as { drawerId?: string; all?: boolean } | undefined;
      if (closePayload?.all) {
        closeAllDrawers();
      } else if (closePayload?.drawerId) {
        setDrawerQueue((prev) => prev.filter((d) => d.id !== closePayload.drawerId));
        if (currentDrawer?.id === closePayload.drawerId) {
          closeDrawer();
        }
      } else {
        closeDrawer();
      }
    };

    const unsubscribeOpen = eventBus.on(openEvent, handleOpen);
    const unsubscribeClose = eventBus.on(closeEvent, handleClose);

    return () => {
      unsubscribeOpen();
      unsubscribeClose();
    };
  }, [eventBus, openEvent, closeEvent, openDrawer, closeDrawer, closeAllDrawers, currentDrawer, defaultPlacement, defaultWidth]);

  const handleAction = useCallback((action: DrawerAction) => {
    if (action.event) {
      eventBus.emit(`UI:${action.event}`, {
        drawerId: currentDrawer?.id,
        entity,
        ...action.payload,
      });
    }
    if (action.navigatesTo) {
      eventBus.emit('UI:NAVIGATE', {
        to: action.navigatesTo,
        drawerId: currentDrawer?.id,
        entity,
        ...action.payload,
      });
    }
  }, [currentDrawer, entity, eventBus]);

  const renderFooter = () => {
    if (!currentDrawer?.actions || currentDrawer.actions.length === 0) {
      return undefined;
    }

    return (
      <HStack spacing={12} justify="flex-end">
        {currentDrawer.actions.map((action, index) => (
          <Button
            key={`${action.label}-${index}`}
            variant={action.variant || 'default'}
            action={action.event}
            actionPayload={{
              drawerId: currentDrawer.id,
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
      <Drawer
        isOpen={!!currentDrawer}
        onClose={closeDrawer}
        title={currentDrawer?.title}
        placement={currentDrawer?.placement || defaultPlacement}
        width={currentDrawer?.width || defaultWidth}
      >
        {currentDrawer?.content}
        {renderFooter()}
      </Drawer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

DrawerSlot.displayName = 'DrawerSlot';
