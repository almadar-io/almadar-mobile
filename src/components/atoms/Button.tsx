import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps 
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: '#6366f1', // indigo-500
  },
  secondary: {
    backgroundColor: '#e2e8f0', // slate-200
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: '#ef4444', // red-500
  },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
};

const textStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: '#ffffff',
  },
  secondary: {
    color: '#1e293b', // slate-800
  },
  ghost: {
    color: '#6366f1', // indigo-500
  },
  destructive: {
    color: '#ffffff',
  },
};

const sizeTextStyles: Record<ButtonSize, TextStyle> = {
  sm: {
    fontSize: 14,
  },
  md: {
    fontSize: 16,
  },
  lg: {
    fontSize: 18,
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onPress,
  children,
  style,
  ...touchableProps
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...touchableProps}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={textStyles[variant].color} 
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <Text style={[
          styles.text,
          textStyles[variant],
          sizeTextStyles[size],
        ]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

Button.displayName = 'Button';
