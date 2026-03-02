import React from 'react';
import { View, ViewStyle, FlexStyle } from 'react-native';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexAlign = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
export type FlexJustify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface FlexProps {
  /** Flex direction */
  direction?: FlexDirection;
  /** Flex wrap */
  wrap?: FlexWrap;
  /** Align items */
  align?: FlexAlign;
  /** Justify content */
  justify?: FlexJustify;
  /** Gap between items */
  gap?: FlexGap;
  /** Flex grow */
  grow?: boolean | number;
  /** Flex shrink */
  shrink?: boolean | number;
  /** Flex basis */
  basis?: string | number;
  /** Custom style */
  style?: ViewStyle;
  /** Children elements */
  children: React.ReactNode;
}

const gapValues: Record<FlexGap, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  wrap = 'nowrap',
  align = 'stretch',
  justify = 'flex-start',
  gap = 'none',
  grow,
  shrink,
  basis,
  style,
  children,
}) => {
  const flexStyle: FlexStyle = {
    flexDirection: direction,
    flexWrap: wrap,
    alignItems: align,
    justifyContent: justify,
    gap: gapValues[gap],
  };

  if (grow !== undefined) {
    flexStyle.flexGrow = grow === true ? 1 : grow === false ? 0 : grow;
  }
  if (shrink !== undefined) {
    flexStyle.flexShrink = shrink === true ? 1 : shrink === false ? 0 : shrink;
  }
  if (basis !== undefined) {
    flexStyle.flexBasis = typeof basis === 'number' ? basis : undefined;
  }

  return (
    <View style={[flexStyle, ...(style ? [style] : [])]}>
      {children}
    </View>
  );
};

Flex.displayName = 'Flex';
