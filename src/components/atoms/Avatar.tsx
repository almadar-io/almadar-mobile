import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle,
  Image,
  ImageSourcePropType 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface AvatarProps {
  src?: ImageSourcePropType;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  initials,
  size = 'md',
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  const sizeMap: Record<string, { container: number; fontSize: number }> = {
    sm: { container: 32, fontSize: 12 },
    md: { container: 40, fontSize: 14 },
    lg: { container: 48, fontSize: 16 },
    xl: { container: 64, fontSize: 20 },
  };

  const { container, fontSize } = sizeMap[size];

  if (isLoading) {
    return (
      <View style={[styles.container, { width: container, height: container }, style]}>
        <LoadingState message="" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { width: container, height: container }, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  const getInitials = () => {
    if (initials) return initials;
    if (alt) {
      return alt
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return '?';
  };

  if (src) {
    return (
      <Image
        source={src}
        style={[
          styles.image,
          { 
            width: container, 
            height: container, 
            borderRadius: container / 2 
          },
          style as never,
        ]}
        accessibilityLabel={alt}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: container,
          height: container,
          borderRadius: container / 2,
          backgroundColor: theme.colors.primary,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize,
            color: theme.colors['primary-foreground'],
          },
        ]}
      >
        {getInitials()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    fontWeight: '600',
  },
});

Avatar.displayName = 'Avatar';
