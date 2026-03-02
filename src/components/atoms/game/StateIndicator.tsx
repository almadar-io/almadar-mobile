import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';

export interface StateStyle {
  icon: string;
  backgroundColor: string;
}

export interface StateIndicatorProps {
  /** The current state name */
  state: string;
  /** Optional label override (defaults to capitalized state name) */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show pulse animation on non-idle states */
  animated?: boolean;
  /** Custom state styles to extend/override defaults */
  stateStyles?: Record<string, StateStyle>;
  /** Additional styles */
  style?: ViewStyle;
}

const DEFAULT_STATE_STYLES: Record<string, StateStyle> = {
  idle: { icon: '⏸', backgroundColor: '#6b7280' },
  active: { icon: '▶', backgroundColor: '#22c55e' },
  sleeping: { icon: '💤', backgroundColor: '#6b7280' },
  moving: { icon: '🚶', backgroundColor: '#3b82f6' },
  eating: { icon: '🍽', backgroundColor: '#22c55e' },
  waiting: { icon: '⏳', backgroundColor: '#eab308' },
  happy: { icon: '😊', backgroundColor: '#22c55e' },
  scared: { icon: '😨', backgroundColor: '#ef4444' },
  done: { icon: '✓', backgroundColor: '#22c55e' },
  error: { icon: '✗', backgroundColor: '#ef4444' },
  ready: { icon: '✓', backgroundColor: '#22c55e' },
  cooldown: { icon: '🔄', backgroundColor: '#eab308' },
};

const DEFAULT_STYLE: StateStyle = { icon: '?', backgroundColor: '#6b7280' };

const SIZE_STYLES: Record<string, { padding: number; fontSize: number }> = {
  sm: { padding: 4, fontSize: 10 },
  md: { padding: 8, fontSize: 12 },
  lg: { padding: 12, fontSize: 14 },
};

export const StateIndicator: React.FC<StateIndicatorProps> = ({
  state,
  label,
  size = 'md',
  animated = true,
  stateStyles,
  style,
}) => {
  const theme = useTheme();
  const mergedStyles = stateStyles
    ? { ...DEFAULT_STATE_STYLES, ...stateStyles }
    : DEFAULT_STATE_STYLES;
  const config = mergedStyles[state.toLowerCase()] || DEFAULT_STYLE;
  const displayLabel = label || state.charAt(0).toUpperCase() + state.slice(1);
  const sizeStyles = SIZE_STYLES[size];
  const shouldAnimate = animated && 
    state.toLowerCase() !== 'idle' && 
    state.toLowerCase() !== 'done';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          paddingHorizontal: sizeStyles.padding,
          paddingVertical: sizeStyles.padding * 0.5,
          opacity: shouldAnimate ? 0.8 : 1,
        },
        style as never,
      ]}
    >
      <Text style={{ fontSize: sizeStyles.fontSize, marginRight: 4 }}>
        {config.icon}
      </Text>
      <Text
        style={{
          fontSize: sizeStyles.fontSize,
          color: theme.colors['primary-foreground'],
          fontWeight: '500',
        }}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
  },
});

StateIndicator.displayName = 'StateIndicator';
