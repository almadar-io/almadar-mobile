import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle,
  ScrollView,
  SafeAreaView 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Header, HeaderAction } from '../organisms/Header';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerActions?: HeaderAction[];
  showHeader?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  scrollable?: boolean;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  headerTitle,
  headerActions = [],
  showHeader = true,
  style,
  contentStyle,
  scrollable = true,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  const Content = scrollable ? ScrollView : View;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        {showHeader && (
          <Header title={headerTitle} rightActions={headerActions} />
        )}
        <LoadingState message="Loading..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        {showHeader && (
          <Header title={headerTitle} rightActions={headerActions} />
        )}
        <ErrorState message={error.message} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      {showHeader && (
        <Header title={headerTitle} rightActions={headerActions} />
      )}
      <Content 
        style={[styles.content, contentStyle]}
        contentContainerStyle={scrollable ? styles.scrollContent : undefined}
      >
        {children}
      </Content>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
});

DashboardLayout.displayName = 'DashboardLayout';
