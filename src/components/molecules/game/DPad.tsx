import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useEventBus } from '../../../hooks/useEventBus';
import { ControlButton } from '../../atoms/game/ControlButton';

export type DPadDirection = 'up' | 'down' | 'left' | 'right';

export interface DPadProps {
  /** Called when a direction is pressed/released */
  onDirection?: (direction: DPadDirection, pressed: boolean) => void;
  /** Declarative event name emitted on direction press/release via useEventBus */
  directionEvent?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to include diagonal buttons */
  includeDiagonals?: boolean;
  /** Additional styles */
  style?: ViewStyle;
  /** Disabled state */
  disabled?: boolean;
}

const sizeMap: Record<string, { button: 'sm' | 'md' | 'lg'; containerWidth: number }> = {
  sm: { button: 'sm', containerWidth: 112 },
  md: { button: 'md', containerWidth: 160 },
  lg: { button: 'lg', containerWidth: 208 },
};

const arrowIcons: Record<DPadDirection, string> = {
  up: '▲',
  down: '▼',
  left: '◀',
  right: '▶',
};

export const DPad: React.FC<DPadProps> = ({
  onDirection,
  directionEvent,
  size = 'md',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  includeDiagonals = false,
  style,
  disabled,
}) => {
  const eventBus = useEventBus();
  const sizes = sizeMap[size];
  const [activeDirections, setActiveDirections] = useState<Set<DPadDirection>>(new Set());

  const handlePress = useCallback(
    (direction: DPadDirection) => {
      setActiveDirections((prev) => new Set(prev).add(direction));
      if (directionEvent) eventBus.emit(`UI:${directionEvent}`, { direction, pressed: true });
      onDirection?.(direction, true);
    },
    [directionEvent, eventBus, onDirection]
  );

  const handleRelease = useCallback(
    (direction: DPadDirection) => {
      setActiveDirections((prev) => {
        const next = new Set(prev);
        next.delete(direction);
        return next;
      });
      if (directionEvent) eventBus.emit(`UI:${directionEvent}`, { direction, pressed: false });
      onDirection?.(direction, false);
    },
    [directionEvent, eventBus, onDirection]
  );

  const createButton = (direction: DPadDirection) => (
    <ControlButton
      key={direction}
      icon={arrowIcons[direction]}
      size={sizes.button}
      variant="secondary"
      pressed={activeDirections.has(direction)}
      onPress={() => handlePress(direction)}
      onRelease={() => handleRelease(direction)}
      disabled={disabled}
    />
  );

  return (
    <View style={[styles.container, { width: sizes.containerWidth }, style]}>
      {/* Row 1: Empty, Up, Empty */}
      <View style={styles.row}>
        <View style={styles.empty} />
        {createButton('up')}
        <View style={styles.empty} />
      </View>

      {/* Row 2: Left, Center, Right */}
      <View style={styles.row}>
        {createButton('left')}
        <View style={styles.center}>
          <View style={styles.centerDot} />
        </View>
        {createButton('right')}
      </View>

      {/* Row 3: Empty, Down, Empty */}
      <View style={styles.row}>
        <View style={styles.empty} />
        {createButton('down')}
        <View style={styles.empty} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  empty: {
    width: 56,
    height: 56,
  },
  center: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#4b5563',
  },
});

DPad.displayName = 'DPad';
