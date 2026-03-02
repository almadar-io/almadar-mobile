import React, { useState, useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  ViewStyle,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  style?: ViewStyle;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  style,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);

  const showTooltip = () => {
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setPosition({ x: pageX, y: pageY, width, height });
      setVisible(true);
    });
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  const tooltipY = position.y - 40;
  const centerX = position.x + position.width / 2;

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPressIn={showTooltip}
        onPressOut={hideTooltip}
        style={style}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <TouchableWithoutFeedback onPress={hideTooltip}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.tooltip,
                {
                  backgroundColor: theme.colors.foreground,
                  top: tooltipY,
                  left: centerX - 60,
                },
              ]}
            >
              <Text style={[styles.text, { color: theme.colors.background }]}>
                {content}
              </Text>
              <View 
                style={[
                  styles.arrow, 
                  { borderTopColor: theme.colors.foreground }
                ]} 
              />
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
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

Tooltip.displayName = 'Tooltip';
