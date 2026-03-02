import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { WorldMapBoard, WorldMapBoardProps } from '../organisms/game/WorldMapBoard';
import { GameHud, GameHudStat } from '../organisms/game/GameHud';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export interface WorldMapTemplateProps {
  /** World map board configuration */
  worldMapBoard: WorldMapBoardProps;
  /** HUD stats configuration */
  hudStats?: GameHudStat[];
  /** Quick navigation buttons */
  navigationActions?: Array<{
    label: string;
    event: string;
    targetNodeId?: string;
    variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  }>;
  /** Template title */
  title?: string;
  /** Current region/act */
  act?: string;
  /** Additional container styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event fired when node is selected */
  onSelectNode?: (nodeId: string) => void;
  /** Event fired when map action occurs */
  onMapAction?: (action: string, targetNodeId?: string) => void;
}

export const WorldMapTemplate: React.FC<WorldMapTemplateProps> = ({
  worldMapBoard,
  hudStats,
  navigationActions,
  title,
  act,
  style,
  isLoading,
  error,
  entity,
  onSelectNode,
  onMapAction,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleSelectNode = (nodeId: string) => {
    eventBus.emit('UI:MAP_SELECT_NODE', { nodeId, entity });
    onSelectNode?.(nodeId);
  };

  const handleMapAction = (action: string, targetNodeId?: string) => {
    eventBus.emit('UI:MAP_ACTION', { action, targetNodeId, entity });
    onMapAction?.(action, targetNodeId);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        <LoadingState message="Loading world map..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        <ErrorState
          message={error.message}
          onRetry={() => eventBus.emit('UI:MAP_RETRY', { entity })}
        />
      </View>
    );
  }

  const hasNodes = worldMapBoard.nodes && worldMapBoard.nodes.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: '#0f172a' }, style]}>
      {/* HUD */}
      {hudStats && hudStats.length > 0 && (
        <View style={styles.hudContainer}>
          <GameHud stats={hudStats} position="corners" transparent />
        </View>
      )}

      {/* Header */}
      {(title || act) && (
        <View style={styles.header}>
          {title && (
            <Typography variant="h2" style={{ color: '#fff' }}>
              {title}
            </Typography>
          )}
          {act && (
            <Typography variant="caption" style={{ color: '#9ca3af' }}>
              {act}
            </Typography>
          )}
        </View>
      )}

      {/* Map Board */}
      <View style={styles.mapContainer}>
        {hasNodes ? (
          <WorldMapBoard
            {...worldMapBoard}
            title={worldMapBoard.title || title}
            act={worldMapBoard.act || act}
            onSelectNode={handleSelectNode}
          />
        ) : (
          <EmptyState
            message="No map locations available"
            icon={<Typography variant="h1">🗺️</Typography>}
          />
        )}
      </View>

      {/* Navigation Actions */}
      {navigationActions && navigationActions.length > 0 && (
        <View style={styles.actionsContainer}>
          <HStack spacing={8} justify="center" style={styles.actions}>
            {navigationActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                action={action.event}
                actionPayload={{ entity, targetNodeId: action.targetNodeId }}
                onPress={() => handleMapAction(action.event, action.targetNodeId)}
              >
                {action.label}
              </Button>
            ))}
          </HStack>
        </View>
      )}
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
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 10,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    zIndex: 20,
  },
  mapContainer: {
    flex: 1,
    padding: 16,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20,
  },
  actions: {
    flexWrap: 'wrap',
  },
});

WorldMapTemplate.displayName = 'WorldMapTemplate';
