import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  PanResponder,
  Dimensions,
  PanResponderGestureState,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { HStack, VStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SplitProps {
  /** Primary pane content (left/top) */
  primary: React.ReactNode;
  /** Secondary pane content (right/bottom) */
  secondary: React.ReactNode;
  /** Initial split percentage (0-100) */
  initialSplit?: number;
  /** Minimum split percentage for primary pane */
  minSplit?: number;
  /** Maximum split percentage for primary pane */
  maxSplit?: number;
  /** Split direction */
  direction?: 'horizontal' | 'vertical';
  /** Whether split is resizable */
  resizable?: boolean;
  /** Container style */
  style?: ViewStyle;
  /** Primary pane style */
  primaryStyle?: ViewStyle;
  /** Secondary pane style */
  secondaryStyle?: ViewStyle;
  /** Callback when split changes */
  onSplitChange?: (percentage: number) => void;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Split: React.FC<SplitProps> = ({
  primary,
  secondary,
  initialSplit = 50,
  minSplit = 20,
  maxSplit = 80,
  direction = 'horizontal',
  resizable = true,
  style,
  primaryStyle,
  secondaryStyle,
  onSplitChange,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const [splitPercentage, setSplitPercentage] = useState(initialSplit);

  const isHorizontal = direction === 'horizontal';

  const handleSplitChange = useCallback(
    (percentage: number) => {
      const clampedPercentage = Math.max(minSplit, Math.min(maxSplit, percentage));
      setSplitPercentage(clampedPercentage);
      onSplitChange?.(clampedPercentage);
    },
    [minSplit, maxSplit, onSplitChange]
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => resizable,
        onMoveShouldSetPanResponder: () => resizable,
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          if (!resizable) return;

          const totalSize = isHorizontal ? SCREEN_WIDTH : 400;
          const delta = isHorizontal ? gestureState.dx : gestureState.dy;
          const deltaPercentage = (delta / totalSize) * 100;
          const newPercentage = splitPercentage + deltaPercentage;
          handleSplitChange(newPercentage);
        },
      }),
    [resizable, isHorizontal, splitPercentage, handleSplitChange]
  );

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

  const primaryFlex = splitPercentage / 100;
  const secondaryFlex = (100 - splitPercentage) / 100;

  const renderResizer = () => {
    if (!resizable) return null;

    return (
      <View
        style={[
          styles.resizer,
          isHorizontal ? styles.resizerHorizontal : styles.resizerVertical,
          { backgroundColor: theme.colors.border },
        ]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.resizerHandle,
            isHorizontal ? styles.resizerHandleHorizontal : styles.resizerHandleVertical,
            { backgroundColor: theme.colors['muted-foreground'] },
          ]}
        />
      </View>
    );
  };

  if (isHorizontal) {
    const hStackStyles: ViewStyle[] = [styles.container];
    if (style) {
      hStackStyles.push(style);
    }

    return (
      <HStack style={hStackStyles}>
        <View style={[{ flex: primaryFlex }, primaryStyle]}>{primary}</View>
        {renderResizer()}
        <View style={[{ flex: secondaryFlex }, secondaryStyle]}>{secondary}</View>
      </HStack>
    );
  }

  const vStackStyles: ViewStyle[] = [styles.container];
  if (style) {
    vStackStyles.push(style);
  }

  return (
    <VStack style={vStackStyles}>
      <View style={[{ flex: primaryFlex }, primaryStyle]}>{primary}</View>
      {renderResizer()}
      <View style={[{ flex: secondaryFlex }, secondaryStyle]}>{secondary}</View>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resizer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  resizerHorizontal: {
    width: 12,
    height: '100%',
  },
  resizerVertical: {
    height: 12,
    width: '100%',
  },
  resizerHandle: {
    borderRadius: 2,
  },
  resizerHandleHorizontal: {
    width: 4,
    height: 32,
  },
  resizerHandleVertical: {
    width: 32,
    height: 4,
  },
});

Split.displayName = 'Split';
