import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../../../providers/ThemeContext';
import { useEventBus } from '../../../../hooks/useEventBus';
import { Card } from '../../../atoms/Card';
import { Typography } from '../../../atoms/Typography';
import { HStack } from '../../../atoms/Stack';
import { LoadingState } from '../../../molecules/LoadingState';
import { ErrorState } from '../../../molecules/ErrorState';

export interface PhysicsBody {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  isStatic?: boolean;
}

export interface PhysicsConstraint {
  id: string;
  bodyAId: string;
  bodyBId: string;
  length: number;
  stiffness: number;
}

export interface SimulationCanvasProps {
  bodies: PhysicsBody[];
  constraints?: PhysicsConstraint[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showVectors?: boolean;
  paused?: boolean;
  onBodyPress?: (body: PhysicsBody) => void;
  onBodyMove?: (bodyId: string, x: number, y: number) => void;
  onCanvasPress?: (x: number, y: number) => void;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  bodies,
  constraints = [],
  width = screenWidth - 32,
  height = 300,
  showGrid = true,
  showVectors = false,
  paused = false,
  onBodyPress,
  onBodyMove,
  onCanvasPress,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        handleCanvasPress(locationX, locationY);
      },
      onPanResponderMove: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (selectedBodyId) {
          const { moveX, moveY } = gestureState;
          handleBodyMove(selectedBodyId, moveX, moveY);
        }
      },
      onPanResponderRelease: () => {
        setSelectedBodyId(null);
      },
    })
  ).current;

  const handleCanvasPress = (x: number, y: number) => {
    const clickedBody = bodies.find((body) => {
      const dx = x - body.x;
      const dy = y - body.y;
      return Math.sqrt(dx * dx + dy * dy) <= body.radius;
    });

    if (clickedBody) {
      setSelectedBodyId(clickedBody.id);
      eventBus.emit('UI:PHYSICS_BODY_PRESSED', { body: clickedBody });
      onBodyPress?.(clickedBody);
    } else {
      eventBus.emit('UI:PHYSICS_CANVAS_PRESSED', { x, y });
      onCanvasPress?.(x, y);
    }
  };

  const handleBodyMove = (bodyId: string, x: number, y: number) => {
    eventBus.emit('UI:PHYSICS_BODY_MOVED', { bodyId, x, y });
    onBodyMove?.(bodyId, x, y);
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridSize = 40;
    const lines = [];

    for (let x = 0; x < width; x += gridSize) {
      lines.push(
        <View
          key={`v-${x}`}
          style={[
            styles.gridLine,
            {
              left: x,
              height,
              width: 1,
              backgroundColor: theme.colors.border,
              opacity: 0.3,
            },
          ]}
        />
      );
    }

    for (let y = 0; y < height; y += gridSize) {
      lines.push(
        <View
          key={`h-${y}`}
          style={[
            styles.gridLine,
            {
              top: y,
              width,
              height: 1,
              backgroundColor: theme.colors.border,
              opacity: 0.3,
            },
          ]}
        />
      );
    }

    return lines;
  };

  const renderConstraints = () => {
    return constraints.map((constraint) => {
      const bodyA = bodies.find((b) => b.id === constraint.bodyAId);
      const bodyB = bodies.find((b) => b.id === constraint.bodyBId);

      if (!bodyA || !bodyB) return null;

      const dx = bodyB.x - bodyA.x;
      const dy = bodyB.y - bodyA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return (
        <View
          key={constraint.id}
          style={[
            styles.constraint,
            {
              left: bodyA.x,
              top: bodyA.y,
              width: distance,
              height: 2,
              backgroundColor: theme.colors.primary,
              opacity: constraint.stiffness,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        />
      );
    });
  };

  const renderBodies = () => {
    return bodies.map((body) => (
      <View
        key={body.id}
        style={[
          styles.body,
          {
            left: body.x - body.radius,
            top: body.y - body.radius,
            width: body.radius * 2,
            height: body.radius * 2,
            backgroundColor: body.color,
            borderColor: selectedBodyId === body.id ? theme.colors.primary : theme.colors.border,
            borderWidth: selectedBodyId === body.id ? 3 : 1,
            opacity: body.isStatic ? 0.7 : 1,
          },
        ]}
      >
        {showVectors && !body.isStatic && (
          <View
            style={[
              styles.velocityVector,
              {
                width: Math.min(Math.sqrt(body.vx * body.vx + body.vy * body.vy) * 5, 40),
                backgroundColor: theme.colors.warning,
                transform: [{ rotate: `${Math.atan2(body.vy, body.vx)}rad` }],
              },
            ]}
          />
        )}
        {body.isStatic && (
          <View style={styles.staticIndicator}>
            <Typography variant="caption" style={{ fontSize: 10, color: theme.colors['muted-foreground'] }}>
              📌
            </Typography>
          </View>
        )}
      </View>
    ));
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, { width, height }, ...(style ? [style] : [])]}>
        <LoadingState message="Loading simulation..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.container, { width, height }, ...(style ? [style] : [])]}>
        <ErrorState message={error.message} />
      </Card>
    );
  }

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <View style={styles.header}>
        <HStack justify="space-between" align="center">
          <Typography variant="h4">Physics Simulation</Typography>
          <HStack spacing={8}>
            <Typography variant="caption" style={{ opacity: 0.6 }}>
              Bodies: {bodies.length}
            </Typography>
            {paused && (
              <Typography variant="caption" style={{ color: theme.colors.warning }}>
                ⏸ Paused
              </Typography>
            )}
          </HStack>
        </HStack>
      </View>

      <View
        style={[
          styles.canvas,
          {
            width,
            height,
            backgroundColor: theme.colors.background,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {renderGrid()}
        {renderConstraints()}
        {renderBodies()}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    padding: 12,
  },
  canvas: {
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
  },
  body: {
    position: 'absolute',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  constraint: {
    position: 'absolute',
    transformOrigin: 'left center',
  },
  velocityVector: {
    height: 2,
    position: 'absolute',
    right: -40,
    top: '50%',
  },
  staticIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
});

SimulationCanvas.displayName = 'SimulationCanvas';
