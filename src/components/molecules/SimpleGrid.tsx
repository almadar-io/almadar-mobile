import React from 'react';
import { View, ViewStyle } from 'react-native';

export type SimpleGridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SimpleGridProps {
  /** Minimum width of each child (for auto columns) */
  minChildWidth?: number;
  /** Exact number of columns */
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Gap between items */
  gap?: SimpleGridGap;
  /** Custom style */
  style?: ViewStyle;
  /** Children elements */
  children: React.ReactNode;
}

const gapValues: Record<SimpleGridGap, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SimpleGrid: React.FC<SimpleGridProps> = ({
  minChildWidth = 150,
  cols,
  gap = 'md',
  style,
  children,
}) => {
  const childrenArray = React.Children.toArray(children);
  const gapValue = gapValues[gap];
  
  // If exact columns specified, use fixed layout
  if (cols) {
    const rowStyle: ViewStyle = {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gapValue,
    };

    return (
      <View style={[rowStyle, ...(style ? [style] : [])]}>
        {childrenArray.map((child, index) => (
          <View key={index} style={{ flex: 1 / cols, padding: gapValue / 2 }}>
            {child}
          </View>
        ))}
      </View>
    );
  }

  // Auto-fit based on minChildWidth using flexWrap
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: gapValue,
  };

  const itemStyle: ViewStyle = {
    minWidth: minChildWidth,
    flex: 1,
  };

  return (
    <View style={[containerStyle, ...(style ? [style] : [])]}>
      {childrenArray.map((child, index) => (
        <View key={index} style={itemStyle}>
          {child}
        </View>
      ))}
    </View>
  );
};

SimpleGrid.displayName = 'SimpleGrid';
