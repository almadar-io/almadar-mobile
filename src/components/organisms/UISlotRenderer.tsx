import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { useEventBus } from '../../hooks/useEventBus';
import { useTheme } from '../../providers/ThemeContext';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export type UIComponentType = 
  | 'card'
  | 'text'
  | 'button'
  | 'input'
  | 'image'
  | 'list'
  | 'custom';

export interface UIComponentConfig {
  type: UIComponentType;
  id: string;
  props?: Record<string, unknown>;
  children?: UIComponentConfig[];
  content?: string;
}

export interface UISlot {
  id: string;
  name: string;
  components: UIComponentConfig[];
  metadata?: Record<string, unknown>;
}

interface KFlowEvent {
  type: string;
  payload?: Record<string, unknown>;
  timestamp: number;
  source?: string;
}

export interface UISlotRendererProps {
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Slot ID to listen for */
  slotId?: string;
  /** Default slot content */
  defaultSlot?: UISlot;
  /** Event name to listen for slot updates */
  slotEvent?: string;
  /** Custom component renderers */
  customRenderers?: Record<string, React.FC<Record<string, unknown>>>;
}

export const UISlotRenderer: React.FC<UISlotRendererProps> = ({
  style,
  isLoading,
  error,
  entity,
  slotId,
  defaultSlot,
  slotEvent = 'UI:SLOT_UPDATE',
  customRenderers = {},
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [slot, setSlot] = useState<UISlot | null>(defaultSlot || null);

  const handleSlotUpdate = useCallback((newSlot: UISlot | { slot: UISlot }) => {
    const slotData = 'slot' in newSlot ? newSlot.slot : newSlot;
    if (!slotId || slotData.id === slotId) {
      setSlot(slotData);
    }
  }, [slotId]);

  const handleClearSlot = useCallback(() => {
    setSlot(null);
  }, []);

  useEffect(() => {
    const handleUpdate = (event: KFlowEvent) => {
      const payload = event.payload;
      if (!payload) return;
      const slotPayload = payload as UISlot | { slot: UISlot };
      handleSlotUpdate(slotPayload);
    };

    const handleClear = () => {
      handleClearSlot();
    };

    const unsubscribeUpdate = eventBus.on(slotEvent, handleUpdate);
    const unsubscribeClear = eventBus.on(`${slotEvent}_CLEAR`, handleClear);

    return () => {
      unsubscribeUpdate();
      unsubscribeClear();
    };
  }, [eventBus, slotEvent, handleSlotUpdate, handleClearSlot]);

  const handleComponentEvent = useCallback((componentId: string, eventName: string, payload?: Record<string, unknown>) => {
    eventBus.emit(`UI:${eventName}`, {
      slotId: slot?.id,
      componentId,
      entity,
      ...payload,
    });
  }, [slot, entity, eventBus]);

  const renderComponent = useCallback((config: UIComponentConfig): React.ReactNode => {
    // Check for custom renderer first
    if (customRenderers[config.type]) {
      const CustomRenderer = customRenderers[config.type];
      return (
        <CustomRenderer
          key={config.id}
          {...config.props}
          onEvent={(eventName: string, payload: Record<string, unknown>) => handleComponentEvent(config.id, eventName, payload)}
        />
      );
    }

    switch (config.type) {
      case 'card':
        return (
          <Card
            key={config.id}
            style={config.props?.style as ViewStyle}
            padding={(config.props?.padding as 'none' | 'sm' | 'md' | 'lg') || 'md'}
          >
            {config.content && (
              <Typography variant="body">{config.content}</Typography>
            )}
            {config.children?.map((child) => renderComponent(child))}
          </Card>
        );

      case 'text':
        return (
          <Typography
            key={config.id}
            variant={(config.props?.variant as 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label') || 'body'}
            color={config.props?.color as string}
          >
            {config.content || ''}
          </Typography>
        );

      case 'button':
        return (
          <Button
            key={config.id}
            variant={(config.props?.variant as 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive') || 'default'}
            action={config.props?.action as string}
            actionPayload={{
              componentId: config.id,
              entity,
              ...(config.props?.payload as Record<string, unknown> || {}),
            }}
            onPress={() => handleComponentEvent(config.id, config.props?.onClick as string || 'BUTTON_CLICK')}
          >
            {config.content || 'Button'}
          </Button>
        );

      case 'list':
        return (
          <VStack key={config.id} spacing={8} style={styles.list}>
            {config.children?.map((child) => renderComponent(child))}
          </VStack>
        );

      case 'custom':
      default:
        return (
          <View key={config.id} style={config.props?.style as ViewStyle}>
            {config.content && (
              <Typography variant="body">{config.content}</Typography>
            )}
            {config.children?.map((child) => renderComponent(child))}
          </View>
        );
    }
  }, [customRenderers, entity, handleComponentEvent]);

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading slot..." />
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

  if (!slot || slot.components.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <EmptyState message="No content in slot" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <VStack spacing={16}>
        {slot.name && (
          <Typography variant="h4" style={{ color: theme.colors.foreground }}>
            {slot.name}
          </Typography>
        )}
        <VStack spacing={12}>
          {slot.components.map((component) => renderComponent(component))}
        </VStack>
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    width: '100%',
  },
});

UISlotRenderer.displayName = 'UISlotRenderer';
