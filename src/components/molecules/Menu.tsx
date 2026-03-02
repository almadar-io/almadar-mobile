import React from 'react';
import { 
  View, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle,
  Modal,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action?: string;
  disabled?: boolean;
}

export interface MenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  style?: ViewStyle;
  onSelect?: (item: MenuItem) => void;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Menu: React.FC<MenuProps> = ({
  trigger,
  items,
  style,
  onSelect,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [visible, setVisible] = React.useState(false);
  const triggerRef = React.useRef<View>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0, width: 0 });

  const showMenu = () => {
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setPosition({ x: pageX, y: pageY + height + 4, width });
      setVisible(true);
    });
  };

  const hideMenu = () => {
    setVisible(false);
  };

  const handleSelect = (item: MenuItem) => {
    if (item.disabled) return;
    
    if (item.action) {
      eventBus.emit(`UI:${item.action}`, { itemId: item.id });
    }
    onSelect?.(item);
    hideMenu();
  };

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={showMenu}
        style={style}
      >
        {trigger}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideMenu}
      >
        <TouchableWithoutFeedback onPress={hideMenu}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.menu,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  top: position.y,
                  left: position.x,
                  minWidth: Math.max(position.width, 200),
                },
              ]}
            >
              <ScrollView>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelect(item)}
                    disabled={item.disabled}
                    style={[
                      styles.item,
                      { opacity: item.disabled ? 0.5 : 1 },
                    ]}
                  >
                    <HStack spacing={12} align="center">
                      {item.icon}
                      <Typography 
                        variant="body" 
                        style={{ color: theme.colors.foreground }}
                      >
                        {item.label}
                      </Typography>
                    </HStack>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
  menu: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
});

Menu.displayName = 'Menu';
