import React, { useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle,
  Animated,
  Easing
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
}) => {
  const theme = useTheme();
  const shimmer = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: width as never,
          height,
          borderRadius,
          backgroundColor: theme.colors.muted,
        },
        style as ViewStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

Skeleton.displayName = 'Skeleton';
