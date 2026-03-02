import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { VStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SidePanelProps {
  /**
   * Panel title
   */
  title: string;

  /**
   * Panel content
   */
  children: React.ReactNode;

  /**
   * Is panel open
   */
  isOpen: boolean;

  /**
   * On close handler
   */
  onClose: () => void;

  /**
   * Panel width (percentage of screen width or absolute number)
   * @default 0.8 (80% of screen width)
   */
  width?: number;

  /**
   * Panel position
   * @default 'right'
   */
  position?: 'left' | 'right';

  /**
   * Show overlay backdrop
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Additional style for the panel container
   */
  style?: ViewStyle;

  /** Loading state indicator */
  isLoading?: boolean;

  /** Error state */
  error?: Error | null;

  /** Entity name for schema-driven auto-fetch */
  entity?: string;

  /** Declarative close event — emits UI:{closeEvent} via eventBus when panel should close */
  closeEvent?: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  title,
  children,
  isOpen,
  onClose,
  width = SCREEN_WIDTH * 0.8,
  position = 'right',
  showOverlay = true,
  style,
  isLoading,
  error,
  closeEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const translateX = React.useRef(
    new Animated.Value(position === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH)
  ).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : position === 'right' ? width : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, position, translateX, width]);

  const handleClose = () => {
    if (closeEvent) {
      eventBus.emit(`UI:${closeEvent}`, {});
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      {showOverlay && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
      )}

      {/* Side Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            width,
            backgroundColor: theme.colors.card,
            [position]: 0,
            transform: [{ translateX }],
            borderLeftColor: theme.colors.border,
            borderRightColor: theme.colors.border,
          },
          position === 'right' ? styles.borderLeft : styles.borderRight,
          style,
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.border,
              backgroundColor: theme.colors.card,
            },
          ]}
        >
          <Typography variant="h4">{title}</Typography>
          <Button variant="ghost" size="sm" onPress={handleClose}>
            ✕
          </Button>
        </View>

        {/* Content */}
        <VStack spacing={0} style={styles.content}>
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error.message} onRetry={handleClose} />
          ) : (
            children
          )}
        </VStack>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1001,
  },
  borderLeft: {
    borderLeftWidth: 1,
  },
  borderRight: {
    borderRightWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

SidePanel.displayName = 'SidePanel';
