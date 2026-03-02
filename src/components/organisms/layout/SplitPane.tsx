import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  PanResponder,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';

import { LoadingState } from '../../molecules/LoadingState';
import { ErrorState } from '../../molecules/ErrorState';

export type SplitDirection = 'horizontal' | 'vertical';

export interface SplitPaneProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  top?: React.ReactNode;
  bottom?: React.ReactNode;
  direction?: SplitDirection;
  initialSplit?: number;
  minSize?: number;
  maxSize?: number;
  style?: ViewStyle;
  splitterStyle?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event name emitted when split changes */
  changeEvent?: string;
}



export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  top,
  bottom,
  direction = 'horizontal',
  initialSplit = 50,
  minSize = 20,
  maxSize = 80,
  style,
  splitterStyle,
  isLoading,
  error,
  entity,
  changeEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [containerSize, setContainerSize] = useState(0);
  const splitPercentRef = useRef(new Animated.Value(initialSplit)).current;
  const currentSplitRef = useRef(initialSplit);

  const validatePaneContent = () => {
    if (direction === 'horizontal') {
      return left !== undefined || right !== undefined;
    }
    return top !== undefined || bottom !== undefined;
  };

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize(direction === 'horizontal' ? width : height);
  }, [direction]);

  const calculateSplitFromPosition = useCallback((position: number): number => {
    if (containerSize === 0) return initialSplit;
    const percent = (position / containerSize) * 100;
    return Math.max(minSize, Math.min(maxSize, percent));
  }, [containerSize, initialSplit, minSize, maxSize]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        splitPercentRef.setOffset(currentSplitRef.current);
        splitPercentRef.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const { moveX, moveY } = gestureState;
        let newPosition: number;

        if (direction === 'horizontal') {
          newPosition = moveX;
        } else {
          newPosition = moveY;
        }

        const newSplit = calculateSplitFromPosition(newPosition);
        currentSplitRef.current = newSplit;
        splitPercentRef.setValue(0);
        splitPercentRef.setOffset(newSplit);

        if (changeEvent) {
          eventBus.emit(`UI:${changeEvent}`, {
            split: newSplit,
            entity,
          });
        }
      },
      onPanResponderRelease: () => {
        splitPercentRef.flattenOffset();
      },
    })
  ).current;

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  if (!validatePaneContent()) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message="SplitPane requires content for both panes" />
      </View>
    );
  }

  const firstPaneStyle: ViewStyle = {
    flex: currentSplitRef.current,
  };

  const secondPaneStyle: ViewStyle = {
    flex: 100 - currentSplitRef.current,
  };

  const isHorizontal = direction === 'horizontal';

  return (
    <View
      style={[styles.container, isHorizontal ? styles.horizontal : styles.vertical, style]}
      onLayout={handleLayout}
    >
      {/* First Pane */}
      <View style={[styles.pane, firstPaneStyle]}>
        {isHorizontal ? left : top}
      </View>

      {/* Splitter */}
      <View
        style={[
          styles.splitter,
          isHorizontal ? styles.splitterHorizontal : styles.splitterVertical,
          { backgroundColor: theme.colors.border },
          splitterStyle,
        ]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.splitterHandle,
            isHorizontal
              ? styles.splitterHandleHorizontal
              : styles.splitterHandleVertical,
            { backgroundColor: theme.colors['muted-foreground'] },
          ]}
        />
      </View>

      {/* Second Pane */}
      <View style={[styles.pane, secondPaneStyle]}>
        {isHorizontal ? right : bottom}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
  pane: {
    overflow: 'hidden',
  },
  splitter: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  splitterHorizontal: {
    width: 16,
  },
  splitterVertical: {
    height: 16,
  },
  splitterHandle: {
    borderRadius: 2,
  },
  splitterHandleHorizontal: {
    width: 4,
    height: 32,
  },
  splitterHandleVertical: {
    width: 32,
    height: 4,
  },
});

SplitPane.displayName = 'SplitPane';
