import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { BattleBoard, BattleBoardProps } from '../organisms/game/BattleBoard';
import { GameHud, GameHudStat } from '../organisms/game/GameHud';
import { GameMenu, MenuOption } from '../organisms/game/GameMenu';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export interface BattleTemplateProps {
  /** Battle board configuration */
  battleBoard: BattleBoardProps;
  /** HUD stats configuration */
  hudStats?: GameHudStat[];
  /** Menu options for battle menu */
  menuOptions?: MenuOption[];
  /** Battle title */
  title?: string;
  /** Show battle menu overlay */
  showMenu?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event fired when battle action occurs */
  onBattleAction?: (action: string) => void;
  /** Event fired when battle ends */
  onBattleEnd?: (result: 'win' | 'lose' | 'flee') => void;
}

export const BattleTemplate: React.FC<BattleTemplateProps> = ({
  battleBoard,
  hudStats,
  menuOptions,
  title,
  showMenu = false,
  style,
  isLoading,
  error,
  entity,
  onBattleAction,
  onBattleEnd,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleBattleAction = (action: string) => {
    eventBus.emit('UI:BATTLE_ACTION', { action, entity });
    onBattleAction?.(action);
  };

  const handleBattleEnd = (result: 'win' | 'lose' | 'flee') => {
    eventBus.emit('UI:BATTLE_END', { result, entity });
    onBattleEnd?.(result);
  };

  const handleMenuSelect = (option: MenuOption) => {
    if (option.event) {
      eventBus.emit(`UI:${option.event}`, { option, entity });
    }
    if (option.navigatesTo) {
      eventBus.emit('UI:navigate', { to: option.navigatesTo });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        <LoadingState message="Loading battle..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        <ErrorState
          message={error.message}
          onRetry={() => eventBus.emit('UI:BATTLE_RETRY', { entity })}
        />
      </View>
    );
  }

  const hasUnits = battleBoard.units && battleBoard.units.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: '#0f172a' }, style]}>
      {/* Header */}
      {title && (
        <View style={styles.header}>
          <Typography variant="h2" style={{ color: '#fff' }}>
            {title}
          </Typography>
        </View>
      )}

      {/* HUD */}
      {hudStats && hudStats.length > 0 && (
        <View style={styles.hudContainer}>
          <GameHud stats={hudStats} position="corners" transparent />
        </View>
      )}

      {/* Battle Board */}
      <View style={styles.boardContainer}>
        {hasUnits ? (
          <BattleBoard
            {...battleBoard}
            onAction={handleBattleAction}
          />
        ) : (
          <EmptyState
            message="No battle units available"
            icon={<Typography variant="h1">⚔️</Typography>}
          />
        )}
      </View>

      {/* Battle Controls */}
      <View style={styles.controls}>
        <HStack spacing={8} justify="center">
          <Button
            variant="primary"
            action="BATTLE_ATTACK"
            actionPayload={{ entity }}
            onPress={() => handleBattleAction('attack')}
          >
            Attack
          </Button>
          <Button
            variant="secondary"
            action="BATTLE_DEFEND"
            actionPayload={{ entity }}
            onPress={() => handleBattleAction('defend')}
          >
            Defend
          </Button>
          <Button
            variant="ghost"
            action="BATTLE_FLEE"
            actionPayload={{ entity }}
            onPress={() => handleBattleEnd('flee')}
          >
            Flee
          </Button>
        </HStack>
      </View>

      {/* Menu Overlay */}
      {showMenu && menuOptions && (
        <View style={styles.menuOverlay}>
          <GameMenu
            title="Battle Menu"
            options={menuOptions}
            onSelect={handleMenuSelect}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  hudContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 10,
    pointerEvents: 'none',
  },
  boardContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  controls: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
});

BattleTemplate.displayName = 'BattleTemplate';
