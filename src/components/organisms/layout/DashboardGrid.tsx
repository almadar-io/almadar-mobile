import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { Card } from '../../atoms/Card';
import { Typography } from '../../atoms/Typography';
import { VStack } from '../../atoms/Stack';
import { LoadingState } from '../../molecules/LoadingState';
import { ErrorState } from '../../molecules/ErrorState';
import { EmptyState } from '../../molecules/EmptyState';

export interface Widget {
  id: string;
  title: string;
  component: React.ReactNode;
  span?: '1' | '2' | '3' | 'full';
  action?: string;
  actionPayload?: Record<string, unknown>;
}

export interface DashboardGridProps {
  widgets: Widget[];
  title?: string;
  columns?: 1 | 2 | 3 | 4;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets,
  title,
  columns: _columns = 2,
  style,
  contentContainerStyle,
  isLoading,
  error,
  entity,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading dashboard..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  if (!widgets || widgets.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <EmptyState message="No widgets available" />
      </View>
    );
  }

  const getWidgetWidth = (span: Widget['span']): ViewStyle => {
    switch (span) {
      case '2':
        return { flex: 2 };
      case '3':
        return { flex: 3 };
      case 'full':
        return { width: '100%' as const };
      case '1':
      default:
        return { flex: 1 };
    }
  };

  return (
    <ScrollView style={[styles.container, style]} contentContainerStyle={contentContainerStyle}>
      <VStack spacing={16}>
        {title && (
          <Typography variant="h3">{title}</Typography>
        )}
        <View style={styles.grid}>
          {widgets.map((widget) => (
            <View
              key={widget.id}
              style={[
                styles.widgetContainer,
                getWidgetWidth(widget.span),
              ]}
            >
              <Card
                style={styles.widgetCard}
                action={widget.action}
                actionPayload={{
                  widgetId: widget.id,
                  entity,
                  ...widget.actionPayload,
                }}
              >
                <VStack spacing={12}>
                  <Typography variant="h4" color={theme.colors['muted-foreground']}>
                    {widget.title}
                  </Typography>
                  <View>{widget.component}</View>
                </VStack>
              </Card>
            </View>
          ))}
        </View>
      </VStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  widgetContainer: {
    padding: 8,
  },
  widgetCard: {
    flex: 1,
  },
});

DashboardGrid.displayName = 'DashboardGrid';
