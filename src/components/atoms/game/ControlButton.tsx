import React, { useState, useCallback } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  GestureResponderEvent,
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';

export interface ControlButtonProps {
  /** Button label text */
  label?: string;
  /** Icon component or emoji */
  icon?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  /** Shape variant */
  shape?: 'circle' | 'rounded' | 'square' | string;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | string;
  /** Called when button is pressed */
  onPress?: () => void;
  /** Called when button is released */
  onRelease?: () => void;
  /** Declarative event name emitted on press via useEventBus */
  pressEvent?: string;
  /** Declarative event name emitted on release via useEventBus */
  releaseEvent?: string;
  /** Whether the button is currently pressed */
  pressed?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

const sizeMap: Record<string, { width: number; height: number; fontSize: number }> = {
  sm: { width: 40, height: 40, fontSize: 14 },
  md: { width: 56, height: 56, fontSize: 16 },
  lg: { width: 72, height: 72, fontSize: 20 },
  xl: { width: 96, height: 96, fontSize: 24 },
};

const shapeMap: Record<string, number> = {
  circle: 9999,
  rounded: 12,
  square: 4,
};

const variantMap: Record<string, { backgroundColor: string; borderColor: string; textColor: string }> = {
  primary: { 
    backgroundColor: '#2563eb', 
    borderColor: '#60a5fa',
    textColor: '#ffffff',
  },
  secondary: { 
    backgroundColor: '#374151', 
    borderColor: '#6b7280',
    textColor: '#ffffff',
  },
  ghost: { 
    backgroundColor: 'transparent', 
    borderColor: 'rgba(255,255,255,0.3)',
    textColor: '#ffffff',
  },
};

export const ControlButton: React.FC<ControlButtonProps> = ({
  label,
  icon,
  size = 'md',
  shape = 'circle',
  variant = 'secondary',
  onPress,
  onRelease,
  pressEvent,
  releaseEvent,
  pressed,
  disabled,
  style,
}) => {
  useTheme(); // Theme hook required by pattern
  const eventBus = useEventBus();
  const [isPressed, setIsPressed] = useState(false);
  const actualPressed = pressed ?? isPressed;

  const sizeConfig = sizeMap[size] ?? sizeMap.md;
  const borderRadius = shapeMap[shape] ?? shapeMap.circle;
  const variantConfig = variantMap[variant] ?? variantMap.secondary;

  const handlePressIn = useCallback(
    (_e: GestureResponderEvent) => {
      if (disabled) return;
      setIsPressed(true);
      if (pressEvent) eventBus.emit(`UI:${pressEvent}`, {});
      onPress?.();
    },
    [disabled, pressEvent, eventBus, onPress]
  );

  const handlePressOut = useCallback(
    (_e: GestureResponderEvent) => {
      if (disabled) return;
      setIsPressed(false);
      if (releaseEvent) eventBus.emit(`UI:${releaseEvent}`, {});
      onRelease?.();
    },
    [disabled, releaseEvent, eventBus, onRelease]
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        {
          width: sizeConfig.width,
          height: sizeConfig.height,
          borderRadius,
          backgroundColor: variantConfig.backgroundColor,
          borderColor: variantConfig.borderColor,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: actualPressed ? 0.95 : 1 }],
        },
        style as never,
      ]}
    >
      {icon ? (
        <Text style={{ fontSize: sizeConfig.fontSize * 1.5 }}>
          {icon as string}
        </Text>
      ) : label ? (
        <Text
          style={{
            fontSize: sizeConfig.fontSize,
            color: variantConfig.textColor,
            fontWeight: '700',
          }}
        >
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    userSelect: 'none',
  },
});

ControlButton.displayName = 'ControlButton';
