import React, { useRef } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';

export interface SwipeAction {
  label: string;
  event: string;
  color: string;
  payload?: Record<string, unknown>;
}

export interface SwipeableRowProps {
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  children: React.ReactNode;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

const ACTION_WIDTH = 80;

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  leftActions = [],
  rightActions = [],
  threshold = 0.3,
  children,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const translateX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const leftWidth = leftActions.length * ACTION_WIDTH;
  const rightWidth = rightActions.length * ACTION_WIDTH;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10,
      onPanResponderMove: (_, gestureState) => {
        const maxLeft = leftWidth;
        const maxRight = -rightWidth;
        const dx = Math.max(maxRight, Math.min(maxLeft, gestureState.dx));
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = screenWidth * threshold;
        let toValue = 0;

        if (gestureState.dx > swipeThreshold && leftActions.length > 0) {
          toValue = leftWidth;
        } else if (gestureState.dx < -swipeThreshold && rightActions.length > 0) {
          toValue = -rightWidth;
        }

        Animated.spring(translateX, {
          toValue,
          useNativeDriver: true,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const handleAction = (action: SwipeAction) => {
    eventBus.emit(`UI:${action.event}`, action.payload);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <View style={[styles.container, style]}>
      {leftActions.length > 0 && (
        <View style={[styles.actionsLeft, { width: leftWidth }]}>
          {leftActions.map(action => (
            <Pressable
              key={action.event}
              onPress={() => handleAction(action)}
              style={[styles.actionButton, { backgroundColor: action.color }]}
            >
              <Typography variant="caption" style={{ color: theme.colors['primary-foreground'], fontWeight: '600' }}>
                {action.label}
              </Typography>
            </Pressable>
          ))}
        </View>
      )}
      {rightActions.length > 0 && (
        <View style={[styles.actionsRight, { width: rightWidth }]}>
          {rightActions.map(action => (
            <Pressable
              key={action.event}
              onPress={() => handleAction(action)}
              style={[styles.actionButton, { backgroundColor: action.color }]}
            >
              <Typography variant="caption" style={{ color: theme.colors['primary-foreground'], fontWeight: '600' }}>
                {action.label}
              </Typography>
            </Pressable>
          ))}
        </View>
      )}
      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.card,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  actionsLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  actionsRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  actionButton: {
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {},
});

SwipeableRow.displayName = 'SwipeableRow';
