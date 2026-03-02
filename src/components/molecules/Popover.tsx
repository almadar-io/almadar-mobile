import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  style?: ViewStyle;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  style,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);
  const screenHeight = Dimensions.get('window').height;

  const showPopover = () => {
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setPosition({ x: pageX, y: pageY, width, height });
      setVisible(true);
    });
  };

  const hidePopover = () => {
    setVisible(false);
  };

  // Position popover below trigger, or above if near bottom
  const popoverY = position.y + position.height + 8;
  const showAbove = popoverY > screenHeight * 0.7;
  const finalY = showAbove ? position.y - 200 : popoverY;

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={showPopover}
        style={style}
      >
        {trigger}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hidePopover}
      >
        <TouchableWithoutFeedback onPress={hidePopover}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.popover,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  top: finalY,
                  left: position.x,
                  minWidth: position.width,
                },
              ]}
            >
              {showAbove && (
                <View style={[styles.arrowUp, { borderBottomColor: theme.colors.card }]} />
              )}
              <View style={styles.content}>
                {content}
              </View>
              {!showAbove && (
                <View style={[styles.arrowDown, { borderTopColor: theme.colors.card }]} />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  popover: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    padding: 12,
  },
  arrowUp: {
    position: 'absolute',
    top: -8,
    left: 20,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowDown: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

Popover.displayName = 'Popover';
