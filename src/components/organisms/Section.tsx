import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { VStack, HStack } from '../atoms/Stack';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Divider } from '../atoms/Divider';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export interface SectionAction {
  /** Action label */
  label: string;
  /** Declarative event name - emits UI:${event} via eventBus on press */
  event?: string;
  /** Payload to include with the event */
  payload?: Record<string, unknown>;
  /** Callback for onPress */
  onPress?: () => void;
  /** Button variant */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Icon element */
  icon?: React.ReactNode;
  /** Whether the action is disabled */
  disabled?: boolean;
}

export interface SectionProps {
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  /** Content to render inside the section */
  children: React.ReactNode;
  /** Actions to display in the section header */
  actions?: SectionAction[];
  /** Whether to wrap content in a Card */
  card?: boolean;
  /** Whether to show a divider at the bottom */
  showDivider?: boolean;
  /** Custom header element (replaces default title/subtitle/actions) */
  customHeader?: React.ReactNode;
  /** Container style */
  style?: ViewStyle;
  /** Content container style */
  contentStyle?: ViewStyle;
  /** Header style */
  headerStyle?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether to show empty state when children is empty */
  showEmptyState?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  actions = [],
  card = false,
  showDivider = false,
  customHeader,
  style,
  contentStyle,
  headerStyle,
  isLoading,
  error,
  entity,
  emptyMessage = 'No content available',
  showEmptyState = false,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleActionPress = (action: SectionAction) => {
    if (action.event) {
      eventBus.emit(`UI:${action.event}`, { ...action.payload, entity });
    }
    action.onPress?.();
  };

  const renderHeader = () => {
    if (customHeader) {
      return <View style={[styles.header, headerStyle]}>{customHeader}</View>;
    }

    if (!title && actions.length === 0) {
      return null;
    }

    const headerStyles: ViewStyle[] = [styles.header];
    if (headerStyle) {
      headerStyles.push(headerStyle);
    }

    return (
      <HStack style={headerStyles} align="center" justify="space-between">
        <VStack spacing={4} style={styles.titleContainer}>
          {title && (
            <Typography variant="h4" style={styles.title}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
              {subtitle}
            </Typography>
          )}
        </VStack>

        {actions.length > 0 && (
          <HStack spacing={8} style={styles.actions}>
            {actions.map((action, index) => (
              <Button
                key={index}
                onPress={() => handleActionPress(action)}
                variant={action.variant || 'ghost'}
                size="sm"
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </HStack>
        )}
      </HStack>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={[styles.content, contentStyle]}>
          <LoadingState message={`Loading ${entity || 'content'}...`} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.content, contentStyle]}>
          <ErrorState message={error.message} />
        </View>
      );
    }

    const isEmpty =
      showEmptyState &&
      (!children ||
        (Array.isArray(children) && children.length === 0));

    if (isEmpty) {
      return (
        <View style={[styles.content, contentStyle]}>
          <EmptyState message={emptyMessage} />
        </View>
      );
    }

    return <View style={[styles.content, contentStyle]}>{children}</View>;
  };

  const contentStyles: ViewStyle[] = [styles.container];
  if (style) {
    contentStyles.push(style);
  }

  const content = (
    <VStack style={contentStyles} spacing={0}>
      {renderHeader()}
      {renderContent()}
      {showDivider && <Divider style={styles.bottomDivider} />}
    </VStack>
  );

  if (card) {
    const cardStyles: ViewStyle[] = [styles.card];
    if (style) {
      cardStyles.push(style);
    }

    return (
      <Card style={cardStyles} padding="md">
        {renderHeader()}
        {renderContent()}
        {showDivider && <Divider style={styles.bottomDivider} />}
      </Card>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    width: '100%',
  },
  header: {
    paddingBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  actions: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  bottomDivider: {
    marginTop: 16,
  },
});

Section.displayName = 'Section';
