import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useEventBus } from '../../../hooks/useEventBus';
import { ControlButton } from '../../atoms/game/ControlButton';

export interface ActionButtonConfig {
  /** Unique identifier */
  id: string;
  /** Display label */
  label?: string;
  /** Icon component or emoji */
  icon?: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | string;
}

export interface ActionButtonsProps {
  /** Button configurations */
  buttons: ActionButtonConfig[];
  /** Called when a button is pressed/released */
  onAction?: (id: string, pressed: boolean) => void;
  /** Declarative event name emitted on action via useEventBus */
  actionEvent?: string;
  /** Layout variant */
  layout?: 'horizontal' | 'vertical' | 'diamond';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional styles */
  style?: ViewStyle;
  /** Disabled state */
  disabled?: boolean;
}

const sizeMap: Record<string, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  buttons,
  onAction,
  actionEvent,
  layout = 'horizontal',
  size = 'md',
  style,
  disabled,
}) => {
  const eventBus = useEventBus();
  const [activeButtons, setActiveButtons] = useState<Set<string>>(new Set());

  const handlePress = useCallback(
    (id: string) => {
      setActiveButtons((prev) => new Set(prev).add(id));
      if (actionEvent) eventBus.emit(`UI:${actionEvent}`, { id, pressed: true });
      onAction?.(id, true);
    },
    [actionEvent, eventBus, onAction]
  );

  const handleRelease = useCallback(
    (id: string) => {
      setActiveButtons((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (actionEvent) eventBus.emit(`UI:${actionEvent}`, { id, pressed: false });
      onAction?.(id, false);
    },
    [actionEvent, eventBus, onAction]
  );

  const buttonSize = sizeMap[size] ?? 'md';

  // Diamond layout: special positioning for 4 buttons (A, B, X, Y style)
  if (layout === 'diamond' && buttons.length === 4) {
    const [top, right, bottom, left] = buttons;
    return (
      <View style={[styles.diamondContainer, style]}>
        {/* Row 1: Empty, Top, Empty */}
        <View style={styles.diamondRow}>
          <View style={styles.diamondEmpty} />
          <ControlButton
            icon={top.icon}
            label={top.label}
            size={buttonSize}
            variant={top.variant}
            pressed={activeButtons.has(top.id)}
            onPress={() => handlePress(top.id)}
            onRelease={() => handleRelease(top.id)}
            disabled={disabled}
          />
          <View style={styles.diamondEmpty} />
        </View>

        {/* Row 2: Left, Center, Right */}
        <View style={styles.diamondRow}>
          <ControlButton
            icon={left.icon}
            label={left.label}
            size={buttonSize}
            variant={left.variant}
            pressed={activeButtons.has(left.id)}
            onPress={() => handlePress(left.id)}
            onRelease={() => handleRelease(left.id)}
            disabled={disabled}
          />
          <View style={styles.diamondCenter} />
          <ControlButton
            icon={right.icon}
            label={right.label}
            size={buttonSize}
            variant={right.variant}
            pressed={activeButtons.has(right.id)}
            onPress={() => handlePress(right.id)}
            onRelease={() => handleRelease(right.id)}
            disabled={disabled}
          />
        </View>

        {/* Row 3: Empty, Bottom, Empty */}
        <View style={styles.diamondRow}>
          <View style={styles.diamondEmpty} />
          <ControlButton
            icon={bottom.icon}
            label={bottom.label}
            size={buttonSize}
            variant={bottom.variant}
            pressed={activeButtons.has(bottom.id)}
            onPress={() => handlePress(bottom.id)}
            onRelease={() => handleRelease(bottom.id)}
            disabled={disabled}
          />
          <View style={styles.diamondEmpty} />
        </View>
      </View>
    );
  }

  const containerStyle = layout === 'vertical' 
    ? styles.verticalContainer 
    : styles.horizontalContainer;

  return (
    <View style={[containerStyle, style]}>
      {buttons.map((button) => (
        <ControlButton
          key={button.id}
          icon={button.icon}
          label={button.label}
          size={buttonSize}
          variant={button.variant}
          pressed={activeButtons.has(button.id)}
          onPress={() => handlePress(button.id)}
          onRelease={() => handleRelease(button.id)}
          disabled={disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  verticalContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  diamondContainer: {
    gap: 4,
  },
  diamondRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  diamondEmpty: {
    width: 56,
    height: 56,
  },
  diamondCenter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#4b5563',
  },
});

ActionButtons.displayName = 'ActionButtons';
