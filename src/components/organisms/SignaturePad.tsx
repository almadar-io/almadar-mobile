import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';

import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface SignaturePoint {
  x: number;
  y: number;
}

export interface SignatureStroke {
  points: SignaturePoint[];
}

export interface SignatureData {
  strokes: SignatureStroke[];
  timestamp: number;
}

export interface SignaturePadProps {
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Width of the signature pad */
  width?: number;
  /** Height of the signature pad */
  height?: number;
  /** Stroke color for the signature */
  strokeColor?: string;
  /** Stroke width for the signature */
  strokeWidth?: number;
  /** Background color for the pad */
  backgroundColor?: string;
  /** Label displayed above the pad */
  label?: string;
  /** Clear button label */
  clearLabel?: string;
  /** Save button label */
  saveLabel?: string;
  /** Event emitted when signature is saved */
  onSave?: (data: SignatureData) => void;
  /** Event name for save action */
  saveAction?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  style,
  isLoading,
  error,
  entity,
  width = 350,
  height = 200,
  strokeColor = '#000000',
  strokeWidth = 2,
  backgroundColor = '#ffffff',
  label = 'Sign here',
  clearLabel = 'Clear',
  saveLabel = 'Save',
  onSave,
  saveAction = 'SIGNATURE_SAVE',
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [strokes, setStrokes] = useState<SignatureStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<SignaturePoint[]>([]);
  const canvasRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        const { locationX, locationY } = event.nativeEvent;
        setCurrentStroke([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        const { locationX, locationY } = event.nativeEvent;
        setCurrentStroke((prev) => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        setStrokes((prev) => [...prev, { points: currentStroke }]);
        setCurrentStroke([]);
      },
    })
  ).current;

  const handleClear = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
    eventBus.emit('UI:SIGNATURE_CLEAR', { entity });
  }, [entity, eventBus]);

  const handleSave = useCallback(() => {
    if (strokes.length === 0 && currentStroke.length === 0) {
      return;
    }

    const signatureData: SignatureData = {
      strokes: currentStroke.length > 0 
        ? [...strokes, { points: currentStroke }]
        : strokes,
      timestamp: Date.now(),
    };

    eventBus.emit(`UI:${saveAction}`, {
      entity,
      signature: signatureData,
    });

    onSave?.(signatureData);
  }, [strokes, currentStroke, entity, saveAction, onSave, eventBus]);

  const renderStroke = (stroke: SignatureStroke, index: number): React.ReactNode => {
    if (stroke.points.length < 2) return null;

    // Create a path-like representation using multiple small Views
    return stroke.points.map((point, pointIndex) => {
      if (pointIndex === 0) return null;
      const prevPoint = stroke.points[pointIndex - 1];
      const dx = point.x - prevPoint.x;
      const dy = point.y - prevPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return (
        <View
          key={`stroke-${index}-segment-${pointIndex}`}
          style={{
            position: 'absolute',
            left: prevPoint.x,
            top: prevPoint.y,
            width: distance,
            height: strokeWidth,
            backgroundColor: strokeColor,
            transform: [{ rotate: `${angle}deg` }],
            transformOrigin: '0 50%',
          }}
        />
      );
    });
  };

  const renderCurrentStroke = (): React.ReactNode => {
    if (currentStroke.length < 2) return null;

    return currentStroke.map((point, index) => {
      if (index === 0) return null;
      const prevPoint = currentStroke[index - 1];
      const dx = point.x - prevPoint.x;
      const dy = point.y - prevPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return (
        <View
          key={`current-segment-${index}`}
          style={{
            position: 'absolute',
            left: prevPoint.x,
            top: prevPoint.y,
            width: distance,
            height: strokeWidth,
            backgroundColor: strokeColor,
            transform: [{ rotate: `${angle}deg` }],
            transformOrigin: '0 50%',
          }}
        />
      );
    });
  };

  if (isLoading) {
    return (
      <View style={{ ...styles.container, ...(style || {}) }}>
        <LoadingState message="Loading signature pad..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ ...styles.container, ...(style || {}) }}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  const hasSignature = strokes.length > 0 || currentStroke.length > 0;

  return (
    <Card style={{ ...styles.container, ...(style || {}) }} padding="md">
      <VStack spacing={12}>
        {label && (
          <Typography variant="label" style={{ color: theme.colors['muted-foreground'] }}>
            {label}
          </Typography>
        )}

        <View
          ref={canvasRef}
          style={{
            ...styles.canvas,
            width,
            height,
            backgroundColor,
            borderColor: theme.colors.border,
          }}
          {...panResponder.panHandlers}
        >
          {/* Render completed strokes */}
          {strokes.map((stroke, index) => renderStroke(stroke, index))}

          {/* Render current stroke being drawn */}
          {renderCurrentStroke()}

          {/* Empty state indicator */}
          {!hasSignature && (
            <View style={styles.emptyState} pointerEvents="none">
              <Typography
                variant="caption"
                style={{ color: theme.colors['muted-foreground'] }}
              >
                Draw signature here
              </Typography>
            </View>
          )}
        </View>

        <HStack spacing={8} justify="flex-end">
          <Button
            variant="ghost"
            onPress={handleClear}
            disabled={!hasSignature}
          >
            {clearLabel}
          </Button>
          <Button
            variant="primary"
            onPress={handleSave}
            disabled={!hasSignature}
            action={saveAction}
            actionPayload={{
              entity,
              hasSignature,
            }}
          >
            {saveLabel}
          </Button>
        </HStack>
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  canvas: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyState: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

SignaturePad.displayName = 'SignaturePad';
