import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle,
  Image,
  ImageBackground,
  Dimensions 
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';

import { Typography } from '../../atoms/Typography';
import { VStack } from '../../atoms/Stack';

export interface MenuOption {
  id?: string;
  label: string;
  event?: string;
  navigatesTo?: string;
  variant?: "primary" | "secondary" | "ghost" | string;
  disabled?: boolean;
  subLabel?: string;
  action?: string;
}

export interface GameMenuProps {
  /** Main title */
  title: string;
  /** Subtitle or tagline */
  subtitle?: string;
  /** Menu options - each renders as a button */
  options?: readonly MenuOption[];
  /** Alias for options */
  menuItems?: readonly MenuOption[];
  /** Callback when an option is selected */
  onSelect?: (option: MenuOption) => void;
  /** Optional eventBus instance */
  eventBus?: unknown;
  /** Background image URL */
  background?: string;
  /** Logo image URL */
  logo?: string;
  /** Additional styles */
  style?: ViewStyle;
}

const { width, height } = Dimensions.get('window');

export const GameMenu: React.FC<GameMenuProps> = ({
  title,
  subtitle,
  options = [],
  menuItems,
  onSelect,
  eventBus,
  background,
  logo,
  style,
}) => {
  const theme = useTheme();
  const defaultEventBus = useEventBus();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bus = (eventBus || defaultEventBus) as { emit: (event: string, data?: unknown) => void };
  const items = menuItems || options;

  const handleOptionPress = React.useCallback((option: MenuOption) => {
    if (option.disabled) return;
    
    // Emit event if specified
    if (option.event) {
      bus.emit(`UI:${option.event}`, option);
    }
    
    // Navigate if specified
    if (option.navigatesTo) {
      bus.emit('UI:navigate', { to: option.navigatesTo });
    }
    
    onSelect?.(option);
  }, [onSelect, bus]);

  const getVariantStyle = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: '#374151',
          borderColor: '#4b5563',
        };
    }
  };

  const content = (
    <VStack 
      spacing={24} 
      align="center" 
      justify="center"
      style={[styles.container, ...(style ? [style] : [])]}
    >
      {/* Logo */}
      {logo && (
        <Image 
          source={{ uri: logo }} 
          style={styles.logo}
          resizeMode="contain"
        />
      )}

      {/* Title Section */}
      <VStack spacing={8} align="center">
        <Typography 
          variant="h1" 
          style={{
            fontSize: 36,
            color: '#fff',
            textShadowColor: 'rgba(0,0,0,0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="h4" 
            style={{ color: '#9ca3af' }}
          >
            {subtitle}
          </Typography>
        )}
      </VStack>

      {/* Menu Options */}
      <VStack spacing={12} style={styles.optionsContainer}>
        {items.map((option, index) => (
          <TouchableOpacity
            key={option.id || index}
            onPress={() => handleOptionPress(option)}
            disabled={option.disabled}
            style={[
              styles.optionButton,
              getVariantStyle(option.variant),
              option.disabled && styles.optionDisabled,
            ]}
          >
            <VStack spacing={2} align="center">
              <Text style={[
                styles.optionLabel,
                option.variant === 'primary' && styles.optionLabelPrimary,
              ]}>
                {option.label}
              </Text>
              {option.subLabel && (
                <Text style={styles.optionSubLabel}>
                  {option.subLabel}
                </Text>
              )}
            </VStack>
          </TouchableOpacity>
        ))}
      </VStack>
    </VStack>
  );

  if (background) {
    return (
      <ImageBackground
        source={{ uri: background }}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {content}
        </View>
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.background, { backgroundColor: '#0f172a' }]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 320,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  optionLabelPrimary: {
    fontWeight: '700',
  },
  optionSubLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
});

GameMenu.displayName = 'GameMenu';
