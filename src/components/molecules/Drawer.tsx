import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  placement?: 'left' | 'right';
  width?: number;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  title,
  placement = 'right',
  width = SCREEN_WIDTH * 0.8,
}) => {
  const translateX = React.useRef(
    new Animated.Value(placement === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH)
  ).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : placement === 'right' ? width : -width,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen, placement, translateX, width]);

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      
      {/* Drawer Panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width,
            [placement]: 0,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.content}>
          {/* Header */}
          {(title || true) && (
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Typography variant="body" color="#6b7280">✕</Typography>
              </TouchableOpacity>
              {title && <Typography variant="h4">{title}</Typography>}
            </View>
          )}

          {/* Drawer Content */}
          <VStack spacing={0} style={styles.children}>
            {children}
          </VStack>
        </View>
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
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  children: {
    flex: 1,
    padding: 16,
  },
});

Drawer.displayName = 'Drawer';
