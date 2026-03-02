import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle,
  StatusBar,
  SafeAreaView 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { HStack } from '../atoms/Stack';

export interface HeaderAction {
  icon?: React.ReactNode;
  label?: string;
  action?: string;
  actionPayload?: Record<string, unknown>;
  onPress?: () => void;
}

export interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  backAction?: string;
  rightActions?: HeaderAction[];
  leftElement?: React.ReactNode;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBack,
  backAction,
  rightActions = [],
  leftElement,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleBack = () => {
    if (backAction) {
      eventBus.emit(`UI:${backAction}`);
    }
    onBack?.();
  };

  const handleAction = (action: HeaderAction) => {
    if (action.action) {
      eventBus.emit(`UI:${action.action}`, action.actionPayload);
    }
    action.onPress?.();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.card} />
        <LoadingState message="Loading..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.card} />
        <ErrorState message={error.message} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.card} />
      <HStack align="center" justify="space-between" style={styles.content}>
        <HStack align="center" spacing={8} style={styles.left}>
          {showBackButton && (
            <TouchableOpacity 
              onPress={handleBack}
              style={styles.backButton}
            >
              <Typography variant="h4" style={{ color: theme.colors.primary }}>
                ←
              </Typography>
            </TouchableOpacity>
          )}
          {leftElement}
          {title && (
            <Typography variant="h4" style={{ color: theme.colors.foreground }}>
              {title}
            </Typography>
          )}
        </HStack>

        {rightActions.length > 0 && (
          <HStack align="center" spacing={12}>
            {rightActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleAction(action)}
                style={styles.actionButton}
              >
                {action.icon || (
                  action.label && (
                    <Typography variant="body" style={{ color: theme.colors.primary }}>
                      {action.label}
                    </Typography>
                  )
                )}
              </TouchableOpacity>
            ))}
          </HStack>
        )}
      </HStack>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 100,
  },
  content: {
    height: 56,
    paddingHorizontal: 16,
  },
  left: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  actionButton: {
    padding: 8,
  },
});

Header.displayName = 'Header';
