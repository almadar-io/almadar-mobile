import React, { useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from './Typography';
import { HStack } from './Stack';
import { VStack } from './Stack';

export interface RangeSliderProps {
  min?: number;
  max?: number;
  value?: number;
  step?: number;
  action?: string;
  actionPayload?: Record<string, unknown>;
  onChange?: (value: number) => void;
  showValue?: boolean;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 4;

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min = 0,
  max = 100,
  value: controlledValue,
  step = 1,
  action,
  actionPayload,
  onChange,
  showValue = false,
  label,
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [internalValue, setInternalValue] = useState(controlledValue ?? min);
  const trackWidth = useRef(0);
  const currentValue = controlledValue ?? internalValue;

  const clamp = (v: number) => {
    const stepped = Math.round((v - min) / step) * step + min;
    return Math.max(min, Math.min(max, stepped));
  };

  const getFraction = () => (currentValue - min) / (max - min);

  const emitValue = (v: number) => {
    const clamped = clamp(v);
    setInternalValue(clamped);
    onChange?.(clamped);
    if (action) {
      eventBus.emit(`UI:${action}`, { ...actionPayload, value: clamped });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (_, gestureState) => {
        const fraction = Math.max(0, Math.min(1, gestureState.x0 / (trackWidth.current || 1)));
        emitValue(fraction * (max - min) + min);
      },
      onPanResponderMove: (_, gestureState) => {
        const startFraction = getFraction();
        const deltaFraction = gestureState.dx / (trackWidth.current || 1);
        const newValue = (startFraction + deltaFraction) * (max - min) + min;
        emitValue(newValue);
      },
    })
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const fraction = getFraction();

  const content = (
    <View
      style={[styles.trackContainer, disabled && { opacity: 0.5 }, style]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.track,
          { backgroundColor: theme.colors.border },
        ]}
      />
      <View
        style={[
          styles.trackFill,
          {
            backgroundColor: theme.colors.primary,
            width: `${fraction * 100}%` as unknown as number,
          },
        ]}
      />
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.card,
            left: `${fraction * 100}%` as unknown as number,
            marginLeft: -THUMB_SIZE / 2,
            ...theme.shadows.sm,
          },
        ]}
      />
    </View>
  );

  if (label || showValue) {
    return (
      <VStack spacing={theme.spacing[2]} style={style}>
        {(label || showValue) && (
          <HStack spacing={0} align="center" style={styles.header}>
            {label && (
              <Typography variant="caption" style={{ color: theme.colors['muted-foreground'], flex: 1 }}>
                {label}
              </Typography>
            )}
            {showValue && (
              <Typography variant="body" style={{ color: theme.colors.foreground, fontWeight: '500' }}>
                {currentValue}
              </Typography>
            )}
          </HStack>
        )}
        {content}
      </VStack>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  trackContainer: {
    height: THUMB_SIZE + 8,
    justifyContent: 'center',
    paddingHorizontal: THUMB_SIZE / 2,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
  },
  trackFill: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: THUMB_SIZE / 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    position: 'absolute',
  },
  header: {
    justifyContent: 'space-between',
  },
});

RangeSlider.displayName = 'RangeSlider';
