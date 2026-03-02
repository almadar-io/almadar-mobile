import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  Text,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';

export interface FloatingAction {
  id: string;
  label: string;
  icon: string;
  onPress?: () => void;
  event?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
}

export interface FloatingActionButtonProps {
  /** Single action */
  action?: {
    icon: string;
    onPress: () => void;
    label?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  };
  /** Multiple actions */
  actions?: FloatingAction[];
  /** Simplified icon API */
  icon?: string;
  /** Simplified onPress API */
  onPress?: () => void;
  /** Simplified variant API */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  /** Button position */
  position?:
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'top-right'
    | 'top-left'
    | 'top-center';
  /** Additional styles */
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  action,
  actions,
  icon,
  onPress,
  variant = 'primary',
  position = 'bottom-right',
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const resolvedAction =
    action ??
    (icon
      ? {
          icon,
          onPress: onPress ?? (() => {}),
          variant,
        }
      : undefined);

  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'bottom-right':
        return { bottom: 24, right: 24 };
      case 'bottom-left':
        return { bottom: 24, left: 24 };
      case 'bottom-center':
        return { bottom: 24, alignSelf: 'center' };
      case 'top-right':
        return { top: 24, right: 24 };
      case 'top-left':
        return { top: 24, left: 24 };
      case 'top-center':
        return { top: 24, alignSelf: 'center' };
      default:
        return { bottom: 24, right: 24 };
    }
  };

  const getVariantColor = (v: string) => {
    switch (v) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return '#22c55e';
      case 'danger':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return theme.colors.primary;
    }
  };

  const toggleExpanded = () => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);
    Animated.spring(animation, {
      toValue: newValue ? 1 : 0,
      useNativeDriver: true,
    }).start();
  };

  // Single action
  if (resolvedAction && (!actions || actions.length === 0)) {
    return (
      <TouchableOpacity
        onPress={resolvedAction.onPress}
        style={[
          styles.fab,
          { backgroundColor: getVariantColor(resolvedAction.variant || 'primary') },
          getPositionStyle(),
          style,
        ]}
        accessibilityLabel={resolvedAction.label || 'Action'}
      >
        <Text style={styles.icon}>{resolvedAction.icon || '+'}</Text>
      </TouchableOpacity>
    );
  }

  // Multiple actions
  if (actions && actions.length > 0) {
    return (
      <View style={[styles.container, getPositionStyle(), style]}>
        {/* Expanded actions */}
        {isExpanded && actions.length > 1 && (
          <View style={styles.actionsContainer}>
            {actions.map((actionItem, index) => {
              const translateY = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [20 * (actions.length - index), 0],
              });
              const opacity = animation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0, 1],
              });

              return (
                <Animated.View
                  key={actionItem.id}
                  style={[
                    styles.actionRow,
                    { opacity, transform: [{ translateY }] },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setIsExpanded(false);
                      if (actionItem.event)
                        eventBus.emit(`UI:${actionItem.event}`, {
                          actionId: actionItem.id,
                        });
                      actionItem.onPress?.();
                    }}
                    style={[
                      styles.actionButton,
                      { backgroundColor: getVariantColor(actionItem.variant || 'primary') },
                    ]}
                  >
                    <Text style={styles.icon}>{actionItem.icon}</Text>
                  </TouchableOpacity>
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>{actionItem.label}</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* Main FAB */}
        <TouchableOpacity
          onPress={() => {
            if (actions.length === 1) {
              if (actions[0].event)
                eventBus.emit(`UI:${actions[0].event}`, {
                  actionId: actions[0].id,
                });
              actions[0].onPress?.();
            } else {
              toggleExpanded();
            }
          }}
          style={[
            styles.fab,
            {
              backgroundColor: isExpanded
                ? theme.colors.secondary
                : theme.colors.primary,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.icon,
              {
                transform: [
                  {
                    rotate: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            +
          </Animated.Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 50,
    alignItems: 'flex-end',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  actionsContainer: {
    marginBottom: 12,
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  label: {
    color: '#fff',
    fontSize: 12,
  },
});

FloatingActionButton.displayName = 'FloatingActionButton';
