import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { HStack, VStack } from '../atoms/Stack';
import { Card } from '../atoms/Card';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ScaledDiagramProps {
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Diagram content to render */
  children: React.ReactNode;
  /** Width of the diagram content */
  contentWidth?: number;
  /** Height of the diagram content */
  contentHeight?: number;
  /** Container width */
  width?: number;
  /** Container height */
  height?: number;
  /** Initial scale */
  initialScale?: number;
  /** Minimum scale */
  minScale?: number;
  /** Maximum scale */
  maxScale?: number;
  /** Enable pan gestures */
  enablePan?: boolean;
  /** Enable zoom gestures (pinch) - simulated with buttons for simplicity */
  enableZoom?: boolean;
  /** Show zoom controls */
  showControls?: boolean;
  /** Title for the diagram */
  title?: string;
  /** Enable double tap to zoom */
  enableDoubleTap?: boolean;
  /** Event prefix for diagram interactions */
  eventPrefix?: string;
}

export const ScaledDiagram: React.FC<ScaledDiagramProps> = ({
  style,
  isLoading,
  error,
  entity,
  children,
  contentWidth = 800,
  contentHeight = 600,
  width = SCREEN_WIDTH - 32,
  height = 400,
  initialScale = 1,
  minScale = 0.5,
  maxScale = 3,
  enablePan = true,
  enableZoom = true,
  showControls = true,
  title,
  enableDoubleTap = true,
  eventPrefix = 'DIAGRAM',
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const scale = useRef(new Animated.Value(initialScale)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const [currentScale, setCurrentScale] = useState(initialScale);
  const lastTranslate = useRef({ x: 0, y: 0 });

  // Clamp values to bounds
  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  }, []);

  // Calculate bounds for panning
  const getBounds = useCallback((newScale: number) => {
    const scaledWidth = contentWidth * newScale;
    const scaledHeight = contentHeight * newScale;
    const maxX = Math.max(0, (scaledWidth - width) / 2);
    const maxY = Math.max(0, (scaledHeight - height) / 2);
    return { maxX, maxY };
  }, [contentWidth, contentHeight, width, height]);

  const handleZoomIn = useCallback(() => {
    if (!enableZoom) return;

    const newScale = clamp(currentScale * 1.25, minScale, maxScale);
    setCurrentScale(newScale);

    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: true,
      friction: 8,
    }).start();

    eventBus.emit(`UI:${eventPrefix}_ZOOM_IN`, {
      entity,
      scale: newScale,
    });
  }, [currentScale, minScale, maxScale, enableZoom, entity, eventPrefix, scale, eventBus, clamp]);

  const handleZoomOut = useCallback(() => {
    if (!enableZoom) return;

    const newScale = clamp(currentScale / 1.25, minScale, maxScale);
    setCurrentScale(newScale);

    // Reset position when zooming out to fit
    if (newScale <= initialScale) {
      lastTranslate.current = { x: 0, y: 0 };
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();
    }

    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: true,
      friction: 8,
    }).start();

    eventBus.emit(`UI:${eventPrefix}_ZOOM_OUT`, {
      entity,
      scale: newScale,
    });
  }, [currentScale, minScale, maxScale, initialScale, enableZoom, entity, eventPrefix, scale, translateX, translateY, eventBus, clamp]);

  const handleReset = useCallback(() => {
    setCurrentScale(initialScale);
    lastTranslate.current = { x: 0, y: 0 };

    Animated.parallel([
      Animated.spring(scale, {
        toValue: initialScale,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();

    eventBus.emit(`UI:${eventPrefix}_RESET`, {
      entity,
      scale: initialScale,
    });
  }, [initialScale, entity, eventPrefix, scale, translateX, translateY, eventBus]);

  const handleDoubleTap = useCallback(() => {
    if (!enableDoubleTap) return;

    if (currentScale > initialScale) {
      handleReset();
    } else {
      const newScale = clamp(currentScale * 2, minScale, maxScale);
      setCurrentScale(newScale);

      Animated.spring(scale, {
        toValue: newScale,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }
  }, [currentScale, initialScale, enableDoubleTap, minScale, maxScale, handleReset, scale, clamp]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enablePan,
      onMoveShouldSetPanResponder: () => enablePan && currentScale > 1,
      onPanResponderGrant: () => {
        lastTranslate.current = {
          x: 0,
          y: 0,
        };
      },
      onPanResponderMove: (_event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (!enablePan || currentScale <= 1) return;

        const { maxX, maxY } = getBounds(currentScale);

        const newX = clamp(
          gestureState.dx,
          -maxX - lastTranslate.current.x,
          maxX - lastTranslate.current.x
        );
        const newY = clamp(
          gestureState.dy,
          -maxY - lastTranslate.current.y,
          maxY - lastTranslate.current.y
        );

        translateX.setValue(newX);
        translateY.setValue(newY);
      },
      onPanResponderRelease: (_event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (!enablePan || currentScale <= 1) return;

        const { maxX, maxY } = getBounds(currentScale);

        lastTranslate.current.x = clamp(
          lastTranslate.current.x + gestureState.dx,
          -maxX,
          maxX
        );
        lastTranslate.current.y = clamp(
          lastTranslate.current.y + gestureState.dy,
          -maxY,
          maxY
        );

        translateX.setOffset(lastTranslate.current.x);
        translateX.setValue(0);
        translateY.setOffset(lastTranslate.current.y);
        translateY.setValue(0);

        eventBus.emit(`UI:${eventPrefix}_PAN`, {
          entity,
          x: lastTranslate.current.x,
          y: lastTranslate.current.y,
          scale: currentScale,
        });
      },
    })
  ).current;

  if (isLoading) {
    return (
      <Card style={{ ...styles.container, width, height, ...(style || {}) }} padding="lg">
        <LoadingState message="Loading diagram..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ ...styles.container, width, height, ...(style || {}) }} padding="lg">
        <ErrorState message={error.message} />
      </Card>
    );
  }

  if (!children) {
    return (
      <Card style={{ ...styles.container, width, height, ...(style || {}) }} padding="lg">
        <EmptyState message="No diagram content" />
      </Card>
    );
  }

  const animatedStyle = {
    transform: [
      { scale },
      { translateX },
      { translateY },
    ],
  };

  return (
    <Card style={{ ...styles.container, width, ...(style || {}) }} padding="md">
      <VStack spacing={12}>
        {/* Header */}
        {(title || showControls) && (
          <HStack justify="space-between" align="center">
            {title && (
              <Typography variant="h4" style={{ color: theme.colors.foreground }}>
                {title}
              </Typography>
            )}
            {showControls && (
              <HStack spacing={8}>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleZoomOut}
                  disabled={!enableZoom || currentScale <= minScale}
                >
                  −
                </Button>
                <Typography variant="body" style={{ minWidth: 50, textAlign: 'center' }}>
                  {Math.round(currentScale * 100)}%
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleZoomIn}
                  disabled={!enableZoom || currentScale >= maxScale}
                >
                  +
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleReset}
                >
                  ⟲
                </Button>
              </HStack>
            )}
          </HStack>
        )}

        {/* Diagram Container */}
        <View
          style={[
            styles.diagramContainer,
            {
              width,
              height,
              backgroundColor: theme.colors.muted,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleDoubleTap}
            style={styles.touchable}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  width: contentWidth,
                  height: contentHeight,
                },
                animatedStyle,
              ]}
              {...panResponder.panHandlers}
            >
              {children}
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Scale Indicator */}
        <Typography
          variant="caption"
          color={theme.colors['muted-foreground']}
          style={{ textAlign: 'center' }}
        >
          Scale: {currentScale.toFixed(2)}x • Double-tap to {currentScale > initialScale ? 'reset' : 'zoom'}
        </Typography>
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  diagramContainer: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  touchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

ScaledDiagram.displayName = 'ScaledDiagram';
