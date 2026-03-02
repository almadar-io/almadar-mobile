import React from 'react';
import { View, ViewStyle, FlatList, ListRenderItem } from 'react-native';

export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps<T = unknown> {
  /** Number of columns */
  columns: number;
  /** Gap between items */
  gap?: GridGap;
  /** Custom style */
  style?: ViewStyle;
  /** Data array (for renderItem) */
  data?: T[];
  /** Render function for each item */
  renderItem?: ListRenderItem<T>;
  /** Key extractor */
  keyExtractor?: (item: T, index: number) => string;
  /** Children (alternative to data/renderItem) */
  children?: React.ReactNode;
}

const gapValues: Record<GridGap, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export function Grid<T>({
  columns,
  gap = 'md',
  style,
  data,
  renderItem,
  keyExtractor,
  children,
}: GridProps<T>): React.ReactElement | null {
  const gapValue = gapValues[gap];

  // If using data/renderItem, use FlatList for performance
  if (data && renderItem) {
    return (
      <FlatList<T>
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={columns}
        columnWrapperStyle={{ gap: gapValue }}
        contentContainerStyle={[
          { gap: gapValue },
          ...(style ? [style] : []),
        ]}
      />
    );
  }

  // Otherwise, use View with flexWrap
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: gapValue,
  };

  const childrenArray = React.Children.toArray(children);
  
  return (
    <View style={[containerStyle, ...(style ? [style] : [])]}>
      {childrenArray.map((child, index) => (
        <View 
          key={index} 
          style={{ 
            flex: 1 / columns,
            padding: gapValue / 2,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

Grid.displayName = 'Grid';
