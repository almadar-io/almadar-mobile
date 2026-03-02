import React from 'react';
import { View, ViewStyle } from 'react-native';

export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto';

export interface SpacerProps {
  /** Fixed size (auto = flex grow) */
  size?: SpacerSize;
  /** Orientation (for fixed sizes) */
  axis?: 'horizontal' | 'vertical';
  /** Custom style */
  style?: ViewStyle;
}

const sizeValues: Record<Exclude<SpacerSize, 'auto'>, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

/**
 * Spacer - Flexible spacing element for flex layouts
 * 
 * Usage:
 * - size="auto" (default): Expands to fill available space (flex: 1)
 * - size="md": Fixed size spacing
 */
export const Spacer: React.FC<SpacerProps> = ({
  size = 'auto',
  axis = 'horizontal',
  style,
}) => {
  if (size === 'auto') {
    return (
      <View 
        style={[{ flex: 1 }, ...(style ? [style] : [])]} 
        accessibilityElementsHidden
      />
    );
  }

  const sizeValue = sizeValues[size];
  const spacerStyle: ViewStyle = axis === 'horizontal' 
    ? { width: sizeValue }
    : { height: sizeValue };

  return (
    <View 
      style={[
        spacerStyle,
        ...(style ? [style] : []),
      ]} 
      accessibilityElementsHidden
    />
  );
};

Spacer.displayName = 'Spacer';
