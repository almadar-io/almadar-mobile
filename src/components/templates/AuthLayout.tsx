import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  backAction?: string;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  footer,
  showBackButton = false,
  onBack,
  backAction,
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        <LoadingState message="Loading..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        <ErrorState message={error.message} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <VStack spacing={24} style={styles.content}>
            {showBackButton && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Typography variant="h4" style={{ color: theme.colors.primary }}>
                  ← Back
                </Typography>
              </TouchableOpacity>
            )}

            <VStack spacing={8} align="center">
              <Typography variant="h1" style={{ color: theme.colors.foreground, textAlign: 'center' }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body" style={{ color: theme.colors['muted-foreground'], textAlign: 'center' }}>
                  {subtitle}
                </Typography>
              )}
            </VStack>

            <View style={styles.form}>
              {children}
            </View>

            {footer && (
              <View style={styles.footer}>
                {footer}
              </View>
            )}
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  form: {
    width: '100%',
  },
  footer: {
    marginTop: 16,
  },
});

AuthLayout.displayName = 'AuthLayout';
