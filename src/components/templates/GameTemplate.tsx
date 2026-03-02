import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { GameHud, GameHudProps } from '../organisms/game/GameHud';
import { GameMenu, GameMenuProps } from '../organisms/game/GameMenu';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { Card } from '../atoms/Card';
import { HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export interface GameAction {
  /** Button label */
  label: string;
  /** Event name to emit */
  event: string;
  /** Button variant */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Optional payload to include with the event */
  payload?: Record<string, unknown>;
}

export interface GameTemplateProps {
  /** Main game content */
  children?: React.ReactNode;
  /** Game title displayed in header */
  title?: string;
  /** Game subtitle */
  subtitle?: string;
  /** HUD configuration */
  hud?: GameHudProps;
  /** Show HUD overlay */
  showHud?: boolean;
  /** Menu configuration (renders menu instead of game content if provided) */
  menu?: Omit<GameMenuProps, 'title' | 'subtitle'> & { title?: string; subtitle?: string };
  /** Show menu overlay */
  showMenu?: boolean;
  /** Quick action buttons displayed at bottom */
  actions?: GameAction[];
  /** Additional container styles */
  style?: ViewStyle;
  /** Content container styles */
  contentStyle?: ViewStyle;
  /** Background color override */
  backgroundColor?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Event fired when template action occurs */
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
}

export const GameTemplate: React.FC<GameTemplateProps> = ({
  children,
  title,
  subtitle,
  hud,
  showHud = true,
  menu,
  showMenu = false,
  actions,
  style,
  contentStyle,
  backgroundColor,
  isLoading,
  error,
  entity,
  emptyMessage = 'No game content available',
  onAction,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleAction = (action: string, payload?: Record<string, unknown>) => {
    eventBus.emit(`UI:${action}`, { ...payload, entity });
    onAction?.(action, payload);
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: backgroundColor || theme.colors.background },
          style,
        ]}
      >
        <LoadingState message="Loading game..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: backgroundColor || theme.colors.background },
          style,
        ]}
      >
        <ErrorState
          message={error.message}
          onRetry={() => handleAction('GAME_RETRY')}
        />
      </SafeAreaView>
    );
  }

  // Render menu if showMenu is true or no children provided
  const shouldShowMenu = showMenu || (!children && menu);

  if (shouldShowMenu && menu) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: backgroundColor || '#0f172a' },
          style,
        ]}
      >
        <GameMenu
          title={menu.title || title || 'Game Menu'}
          subtitle={menu.subtitle || subtitle}
          options={menu.options || menu.menuItems || []}
          onSelect={(option) => {
            if (option.event) {
              handleAction(option.event, { option });
            }
            if (option.navigatesTo) {
              handleAction('navigate', { to: option.navigatesTo });
            }
            menu.onSelect?.(option);
          }}
          background={menu.background}
          logo={menu.logo}
          style={menu.style}
        />
      </SafeAreaView>
    );
  }

  const hasContent = React.Children.count(children) > 0;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: backgroundColor || theme.colors.background },
        style,
      ]}
    >
      {/* HUD Overlay */}
      {showHud && hud && (
        <View style={styles.hudOverlay}>
          <GameHud {...hud} />
        </View>
      )}

      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Typography variant="h2" style={styles.title}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body" color={theme.colors['muted-foreground']}>
              {subtitle}
            </Typography>
          )}
        </View>
      )}

      {/* Main Content */}
      <View style={[styles.content, contentStyle]}>
        {hasContent ? (
          children
        ) : (
          <EmptyState
            message={emptyMessage}
            icon={<Typography variant="h1">🎮</Typography>}
          />
        )}
      </View>

      {/* Action Bar */}
      {actions && actions.length > 0 && (
        <View style={styles.actionBar}>
          <Card variant="elevated" style={styles.actionCard}>
            <HStack spacing={8} justify="center" style={styles.actions}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  action={action.event}
                  actionPayload={{ ...action.payload, entity }}
                  onPress={() => handleAction(action.event, action.payload)}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </HStack>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
    zIndex: 10,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    zIndex: 20,
  },
  title: {
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  actionBar: {
    padding: 16,
    zIndex: 20,
  },
  actionCard: {
    padding: 12,
  },
  actions: {
    flexWrap: 'wrap',
  },
});

GameTemplate.displayName = 'GameTemplate';
