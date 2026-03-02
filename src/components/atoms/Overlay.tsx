import React from 'react';
import { 
  TouchableWithoutFeedback, 
  View,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';

export interface OverlayProps {
  /** Whether overlay is visible */
  isVisible?: boolean;
  /** Called when overlay is pressed */
  onPress?: () => void;
  /** Whether to apply blur effect (iOS only) */
  blur?: boolean;
  /** Declarative event name — emits UI:{action} via eventBus on press */
  action?: string;
  /** Additional styles */
  style?: ViewStyle;
}

export const Overlay: React.FC<OverlayProps> = ({
  isVisible = true,
  onPress,
  blur = true,
  action,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  if (!isVisible) return null;

  const handlePress = () => {
    if (action) {
      eventBus.emit(`UI:${action}`, {});
    }
    onPress?.();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View 
        style={[
          styles.overlay,
          { 
            backgroundColor: theme.colors.background,
            opacity: 0.8,
          },
          blur && styles.blur,
          ...(style ? [style] : []),
        ]}
        pointerEvents="auto"
      />
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
  blur: {
    // Note: For actual blur effect on iOS, use @react-native-community/blur
    // This is a fallback opacity-based overlay
  },
});

Overlay.displayName = 'Overlay';
