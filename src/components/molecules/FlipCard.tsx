import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped?: boolean;
  onFlip?: (isFlipped: boolean) => void;
  duration?: number;
  disabled?: boolean;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  flipped: controlledFlipped,
  onFlip,
  duration = 400,
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped ?? internalFlipped;
  const flipAnim = useRef(new Animated.Value(isFlipped ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, duration, flipAnim]);

  const handleFlip = () => {
    if (disabled) return;
    const nextFlipped = !isFlipped;
    setInternalFlipped(nextFlipped);
    onFlip?.(nextFlipped);
  };

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <Pressable onPress={handleFlip} disabled={disabled} style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.face,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.lg,
            ...theme.shadows.sm,
            transform: [{ rotateY: frontRotateY }],
          },
        ]}
      >
        {front}
      </Animated.View>
      <Animated.View
        style={[
          styles.face,
          styles.backFace,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.lg,
            ...theme.shadows.sm,
            transform: [{ rotateY: backRotateY }],
          },
        ]}
      >
        {back}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {},
  face: {
    backfaceVisibility: 'hidden',
    padding: 16,
  },
  backFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

FlipCard.displayName = 'FlipCard';
