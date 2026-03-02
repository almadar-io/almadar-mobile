import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle,
  Animated
} from 'react-native';

// Canvas dimensions for future use
// const { width, height } = Dimensions.get('window');

export type EffectType = 
  | 'shake' 
  | 'flash' 
  | 'fade' 
  | 'particle' 
  | 'glow'
  | 'dissolve'
  | 'portal'
  | 'explosion';

export interface CanvasEffectProps {
  /** Type of visual effect */
  type: EffectType;
  /** Whether effect is active */
  active: boolean;
  /** Effect duration in ms */
  duration?: number;
  /** Effect intensity (0-1) */
  intensity?: number;
  /** Effect color */
  color?: string;
  /** Position for centered effects */
  position?: { x: number; y: number };
  /** Callback when effect completes */
  onComplete?: () => void;
  /** Additional styles */
  style?: ViewStyle;
}

export const CanvasEffect: React.FC<CanvasEffectProps> = ({
  type,
  active,
  duration = 500,
  intensity = 0.5,
  color = '#fff',
  position,
  onComplete,
  style,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!active || hasTriggered.current) return;
    
    hasTriggered.current = true;
    
    // Reset animation
    animValue.setValue(0);
    
    // Create animation based on type
    const animation = Animated.timing(animValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    });
    
    animation.start(({ finished }) => {
      if (finished) {
        hasTriggered.current = false;
        onComplete?.();
      }
    });
    
    return () => {
      animation.stop();
    };
  }, [active, duration, type]);

  // Reset trigger when active becomes false
  useEffect(() => {
    if (!active) {
      hasTriggered.current = false;
    }
  }, [active]);

  if (!active && type !== 'glow') return null;

  const getEffectStyle = () => {
    switch (type) {
      case 'shake':
        return {
          transform: [{
            translateX: animValue.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0, -10 * intensity, 10 * intensity, -10 * intensity, 0],
            }),
          }],
        };
      case 'flash':
        return {
          opacity: animValue.interpolate({
            inputRange: [0, 0.1, 0.9, 1],
            outputRange: [0, 1, 1, 0],
          }),
        };
      case 'fade':
        return {
          opacity: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        };
      case 'glow':
        return {
          opacity: active 
            ? 0.3 + (0.4 * intensity)
            : animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0],
              }),
        };
      case 'explosion':
        return {
          transform: [{
            scale: animValue.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0.5, 1.5, 2],
            }),
          }],
          opacity: animValue.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [1, 0.8, 0],
          }),
        };
      case 'portal':
        return {
          transform: [{
            rotate: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          }],
          opacity: animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0],
          }),
        };
      default:
        return {};
    }
  };

  const getEffectContent = () => {
    switch (type) {
      case 'flash':
        return (
          <View style={[styles.overlay, { backgroundColor: color }]} />
        );
      case 'glow':
        return (
          <View 
            style={[
              styles.glow, 
              { 
                backgroundColor: color,
                shadowColor: color,
                shadowRadius: 20 * intensity,
              }
            ]} 
          />
        );
      case 'explosion':
        return (
          <View style={[styles.explosion, { backgroundColor: color }]} />
        );
      case 'portal':
        return (
          <View style={styles.portalContainer}>
            <View style={[styles.portal, { borderColor: color }]} />
            <View style={[styles.portalInner, { borderColor: color }]} />
          </View>
        );
      case 'particle':
        return (
          <View style={styles.particles}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  {
                    backgroundColor: color,
                    transform: [{
                      translateX: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.cos(i * Math.PI / 4) * 50 * intensity],
                      }),
                    }, {
                      translateY: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.sin(i * Math.PI / 4) * 50 * intensity],
                      }),
                    }],
                    opacity: animValue.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1, 0],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        position ? {
          position: 'absolute',
          left: position.x,
          top: position.y,
        } : null,
        getEffectStyle(),
        ...(style ? [style] : []),
      ]}
      pointerEvents="none"
    >
      {getEffectContent()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  explosion: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  portalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  portal: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    position: 'absolute',
  },
  portalInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  particles: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

CanvasEffect.displayName = 'CanvasEffect';
