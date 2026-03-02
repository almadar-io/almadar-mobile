import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  isLoading = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: theme.colors.primary,
          },
          text: {
            color: theme.colors['primary-foreground'],
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.colors.secondary,
          },
          text: {
            color: theme.colors['secondary-foreground'],
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: theme.colors.primary,
          },
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: theme.colors.error,
          },
          text: {
            color: theme.colors['error-foreground'],
          },
        };
      default:
        return {
          container: {
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
          text: {
            color: theme.colors.foreground,
          },
        };
    }
  };

  const sizeStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: {
        paddingVertical: theme.spacing[1],
        paddingHorizontal: theme.spacing[3],
        borderRadius: theme.borderRadius.md,
      },
      text: {
        fontSize: theme.typography.sizes.sm,
      },
    },
    md: {
      container: {
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[4],
        borderRadius: theme.borderRadius.md,
      },
      text: {
        fontSize: theme.typography.sizes.base,
      },
    },
    lg: {
      container: {
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[6],
        borderRadius: theme.borderRadius.lg,
      },
      text: {
        fontSize: theme.typography.sizes.lg,
      },
    },
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.button,
        variantStyle.container,
        sizeStyle.container,
        (disabled || isLoading) && { opacity: 0.5 },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variantStyle.text.color} size="small" />
      ) : (
        <Text style={[styles.text, variantStyle.text, sizeStyle.text, textStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '500',
  },
});

Button.displayName = 'Button';
