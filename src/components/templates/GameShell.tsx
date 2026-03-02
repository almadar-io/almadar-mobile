import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { GameHud, GameHudProps } from '../organisms/game/GameHud';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface GameShellProps {
  /** Main game content */
  children: React.ReactNode;
  /** HUD configuration */
  hud?: GameHudProps;
  /** Show HUD */
  showHud?: boolean;
  /** Header component (optional) */
  header?: React.ReactNode;
  /** Footer component (optional) */
  footer?: React.ReactNode;
  /** Additional container styles */
  style?: ViewStyle;
  /** Game area styles */
  gameAreaStyle?: ViewStyle;
  /** Background color override */
  backgroundColor?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const GameShell: React.FC<GameShellProps> = ({
  children,
  hud,
  showHud = true,
  header,
  footer,
  style,
  gameAreaStyle,
  backgroundColor,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: backgroundColor || theme.colors.background },
          style,
        ]}
      >
        <StatusBar barStyle="light-content" />
        {header}
        <View style={styles.loadingContainer}>
          <LoadingState message="Loading game..." />
        </View>
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
        <StatusBar barStyle="light-content" />
        {header}
        <View style={styles.loadingContainer}>
          <ErrorState
            message={error.message}
            onRetry={() => eventBus.emit('UI:GAME_RETRY', {})}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: backgroundColor || theme.colors.background },
        style,
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      {header && <View style={styles.header}>{header}</View>}

      {/* Game Area with HUD Overlay */}
      <View style={[styles.gameArea, gameAreaStyle]}>
        {children}

        {/* HUD Overlay */}
        {showHud && hud && (
          <View style={styles.hudContainer}>
            <GameHud
              {...hud}
              style={{ ...styles.hud, ...hud.style }}
            />
          </View>
        )}
      </View>

      {/* Footer */}
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    zIndex: 20,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  hudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  hud: {
    pointerEvents: 'auto',
  },
  footer: {
    zIndex: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

GameShell.displayName = 'GameShell';
