import React from 'react';
import { View, ViewStyle } from 'react-native';

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface ContainerProps {
  /** Maximum width */
  size?: ContainerSize;
  /** Alias for size */
  maxWidth?: ContainerSize;
  /** Horizontal padding */
  padding?: ContainerPadding;
  /** Center horizontally */
  center?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Children elements */
  children?: React.ReactNode;
}

const sizeValues: Record<ContainerSize, number> = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  full: 99999,
};

const paddingValues: Record<ContainerPadding, number> = {
  none: 0,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export const Container: React.FC<ContainerProps> = ({
  size,
  maxWidth,
  padding = 'md',
  center = true,
  style,
  children,
}) => {
  const resolvedSize = maxWidth ?? size ?? 'lg';
  
  const containerStyle: ViewStyle = {
    width: '100%',
    maxWidth: sizeValues[resolvedSize],
    paddingHorizontal: paddingValues[padding],
    ...(center && { alignSelf: 'center' }),
  };

  return (
    <View style={[containerStyle, ...(style ? [style] : [])]}>
      {children}
    </View>
  );
};

Container.displayName = 'Container';
