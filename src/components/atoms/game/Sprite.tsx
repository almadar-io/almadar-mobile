import React, { useMemo } from 'react';
import { 
  View, 
  Image, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle,
  ImageSourcePropType 
} from 'react-native';
import { useEventBus } from '../../../hooks/useEventBus';

export interface SpriteProps {
  /** Spritesheet image URL or require */
  spritesheet: ImageSourcePropType;
  /** Width of each frame in pixels */
  frameWidth: number;
  /** Height of each frame in pixels */
  frameHeight: number;
  /** Frame index to display (0-based, left-to-right, top-to-bottom) */
  frame: number;
  /** X position in pixels */
  x: number;
  /** Y position in pixels */
  y: number;
  /** Scale factor (default: 1) */
  scale?: number;
  /** Flip horizontally */
  flipX?: boolean;
  /** Flip vertically */
  flipY?: boolean;
  /** Rotation in degrees */
  rotation?: number;
  /** Opacity (0-1) */
  opacity?: number;
  /** Z-index for layering */
  zIndex?: number;
  /** Number of columns in spritesheet (for frame calculation) */
  columns?: number;
  /** Optional style */
  style?: ViewStyle;
  /** Optional onPress handler */
  onPress?: () => void;
  /** Declarative event name emitted on press via useEventBus */
  action?: string;
}

/**
 * Sprite component for rendering spritesheet frames
 */
export const Sprite: React.FC<SpriteProps> = ({
  spritesheet,
  frameWidth,
  frameHeight,
  frame,
  x,
  y,
  scale = 1,
  flipX = false,
  flipY = false,
  rotation = 0,
  opacity = 1,
  zIndex = 0,
  columns = 16,
  style,
  onPress,
  action,
}) => {
  const eventBus = useEventBus();

  // Calculate source position in spritesheet
  const sourcePosition = useMemo(() => {
    const frameX = frame % columns;
    const frameY = Math.floor(frame / columns);
    return {
      x: frameX * frameWidth,
      y: frameY * frameHeight,
    };
  }, [frame, columns, frameWidth, frameHeight]);

  const handlePress = () => {
    if (action) eventBus.emit(`UI:${action}`, {});
    onPress?.();
  };

  const transform = [
    { translateX: x },
    { translateY: y },
    { scale: scale },
    { rotate: `${rotation}deg` },
    { scaleX: flipX ? -1 : 1 },
    { scaleY: flipY ? -1 : 1 },
  ];

  const Container = (action || onPress) ? TouchableOpacity : View;

  return (
    <Container
      onPress={(action || onPress) ? handlePress : undefined}
      style={[
        styles.container,
        {
          width: frameWidth,
          height: frameHeight,
          transform,
          opacity,
          zIndex,
        },
        style as never,
      ]}
    >
      <View
        style={{
          width: frameWidth * columns,
          height: frameHeight * Math.ceil((frame + 1) / columns),
          position: 'absolute',
          left: -sourcePosition.x,
          top: -sourcePosition.y,
          overflow: 'hidden',
        }}
      >
        <Image
          source={spritesheet}
          style={{
            width: frameWidth * columns,
            height: frameHeight * Math.ceil((frame + 1) / columns),
            resizeMode: 'stretch',
          }}
        />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
  },
});

Sprite.displayName = 'Sprite';
