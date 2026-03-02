import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { CastleBoard, CastleBoardProps } from '../organisms/game/CastleBoard';
import { GameHud, GameHudStat } from '../organisms/game/GameHud';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export interface CastleTemplateProps {
  /** Castle board configuration */
  castleBoard: CastleBoardProps;
  /** HUD stats configuration */
  hudStats?: GameHudStat[];
  /** Quick action buttons */
  actions?: Array<{
    label: string;
    event: string;
    variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  }>;
  /** Template title */
  title?: string;
  /** Additional container styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event fired when room is entered */
  onEnterRoom?: (roomId: string) => void;
  /** Event fired when castle action occurs */
  onCastleAction?: (action: string) => void;
}

export const CastleTemplate: React.FC<CastleTemplateProps> = ({
  castleBoard,
  hudStats,
  actions,
  title,
  style,
  isLoading,
  error,
  entity,
  onEnterRoom,
  onCastleAction,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleEnterRoom = (roomId: string) => {
    eventBus.emit('UI:CASTLE_ENTER_ROOM', { roomId, entity });
    onEnterRoom?.(roomId);
  };

  const handleAction = (action: string) => {
    eventBus.emit('UI:CASTLE_ACTION', { action, entity });
    onCastleAction?.(action);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        <LoadingState message="Loading castle..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        <ErrorState
          message={error.message}
          onRetry={() => eventBus.emit('UI:CASTLE_RETRY', { entity })}
        />
      </View>
    );
  }

  const hasRooms = castleBoard.rooms && castleBoard.rooms.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: '#1e293b' }, style]}>
      {/* HUD */}
      {hudStats && hudStats.length > 0 && (
        <View style={styles.hudContainer}>
          <GameHud stats={hudStats} position="top" transparent />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        {title && (
          <View style={styles.header}>
            <Typography variant="h2" style={{ color: '#fbbf24' }}>
              {title}
            </Typography>
          </View>
        )}

        {/* Castle Board */}
        <View style={styles.boardContainer}>
          {hasRooms ? (
            <CastleBoard
              {...castleBoard}
              onSelectRoom={handleEnterRoom}
            />
          ) : (
            <EmptyState
              message="No castle rooms available"
              icon={<Typography variant="h1">🏰</Typography>}
            />
          )}
        </View>

        {/* Action Buttons */}
        {actions && actions.length > 0 && (
          <View style={styles.actionsContainer}>
            <HStack spacing={8} justify="center" style={styles.actions}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  action={action.event}
                  actionPayload={{ entity }}
                  onPress={() => handleAction(action.event)}
                >
                  {action.label}
                </Button>
              ))}
            </HStack>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  boardContainer: {
    padding: 16,
  },
  actionsContainer: {
    padding: 16,
  },
  actions: {
    flexWrap: 'wrap',
  },
});

CastleTemplate.displayName = 'CastleTemplate';
