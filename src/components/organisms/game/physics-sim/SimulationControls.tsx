import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../../providers/ThemeContext';
import { useEventBus } from '../../../../hooks/useEventBus';
import { Card } from '../../../atoms/Card';
import { Badge } from '../../../atoms/Badge';
import { Button } from '../../../atoms/Button';
import { Typography } from '../../../atoms/Typography';
import { HStack, VStack } from '../../../atoms/Stack';
import { LoadingState } from '../../../molecules/LoadingState';
import { ErrorState } from '../../../molecules/ErrorState';

export type SimulationTool = 'select' | 'add-circle' | 'add-box' | 'add-static' | 'constraint' | 'delete';

export interface SimulationParameter {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface SimulationControlsProps {
  isPlaying?: boolean;
  speed?: number;
  selectedTool?: SimulationTool;
  parameters?: SimulationParameter[];
  showGrid?: boolean;
  showVectors?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onStep?: () => void;
  onSpeedChange?: (speed: number) => void;
  onToolSelect?: (tool: SimulationTool) => void;
  onParameterChange?: (paramId: string, value: number) => void;
  onToggleGrid?: () => void;
  onToggleVectors?: () => void;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

const tools: Array<{ id: SimulationTool; label: string; icon: string }> = [
  { id: 'select', label: 'Select', icon: '👆' },
  { id: 'add-circle', label: 'Circle', icon: '⭕' },
  { id: 'add-box', label: 'Box', icon: '⬜' },
  { id: 'add-static', label: 'Static', icon: '📌' },
  { id: 'constraint', label: 'Link', icon: '🔗' },
  { id: 'delete', label: 'Delete', icon: '🗑️' },
];

const speedOptions = [0.25, 0.5, 1, 1.5, 2];

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying = false,
  speed = 1,
  selectedTool = 'select',
  parameters = [],
  showGrid = true,
  showVectors = false,
  onPlay,
  onPause,
  onReset,
  onStep,
  onSpeedChange,
  onToolSelect,
  onParameterChange,
  onToggleGrid,
  onToggleVectors,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePlay = () => {
    eventBus.emit('UI:SIMULATION_PLAY', {});
    onPlay?.();
  };

  const handlePause = () => {
    eventBus.emit('UI:SIMULATION_PAUSE', {});
    onPause?.();
  };

  const handleReset = () => {
    eventBus.emit('UI:SIMULATION_RESET', {});
    onReset?.();
  };

  const handleStep = () => {
    eventBus.emit('UI:SIMULATION_STEP', {});
    onStep?.();
  };

  const handleSpeedChange = (newSpeed: number) => {
    eventBus.emit('UI:SIMULATION_SPEED_CHANGED', { speed: newSpeed });
    onSpeedChange?.(newSpeed);
  };

  const handleToolSelect = (tool: SimulationTool) => {
    eventBus.emit('UI:SIMULATION_TOOL_SELECTED', { tool });
    onToolSelect?.(tool);
  };

  const handleParameterChange = (paramId: string, value: number) => {
    eventBus.emit('UI:SIMULATION_PARAMETER_CHANGED', { paramId, value });
    onParameterChange?.(paramId, value);
  };

  const handleToggleGrid = () => {
    eventBus.emit('UI:SIMULATION_TOGGLE_GRID', { showGrid: !showGrid });
    onToggleGrid?.();
  };

  const handleToggleVectors = () => {
    eventBus.emit('UI:SIMULATION_TOGGLE_VECTORS', { showVectors: !showVectors });
    onToggleVectors?.();
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading controls..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <ErrorState message={error.message} />
      </Card>
    );
  }

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <VStack spacing={16}>
        <View style={styles.section}>
          <Typography variant="caption" style={styles.sectionTitle}>
            Playback
          </Typography>
          <HStack spacing={8}>
            {!isPlaying ? (
              <Button variant="primary" size="sm" onPress={handlePlay} style={styles.playButton}>
                ▶ Play
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onPress={handlePause} style={styles.playButton}>
                ⏸ Pause
              </Button>
            )}
            <Button variant="secondary" size="sm" onPress={handleStep}>
              ⏭ Step
            </Button>
            <Button variant="ghost" size="sm" onPress={handleReset}>
              ↺ Reset
            </Button>
          </HStack>
        </View>

        <View style={styles.section}>
          <Typography variant="caption" style={styles.sectionTitle}>
            Speed
          </Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack spacing={8}>
              {speedOptions.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => handleSpeedChange(s)}
                  activeOpacity={0.8}
                >
                  <Badge variant={speed === s ? 'primary' : 'default'} size="md">
                    {s}x
                  </Badge>
                </TouchableOpacity>
              ))}
            </HStack>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Typography variant="caption" style={styles.sectionTitle}>
            Tools
          </Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack spacing={8}>
              {tools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  onPress={() => handleToolSelect(tool.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.toolButton,
                      {
                        backgroundColor:
                          selectedTool === tool.id
                            ? theme.colors.primary + '20'
                            : theme.colors.surface,
                        borderColor:
                          selectedTool === tool.id
                            ? theme.colors.primary
                            : theme.colors.border,
                      },
                    ]}
                  >
                    <Typography variant="body">{tool.icon}</Typography>
                    <Typography variant="caption" style={{ fontSize: 10 }}>
                      {tool.label}
                    </Typography>
                  </View>
                </TouchableOpacity>
              ))}
            </HStack>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Typography variant="caption" style={styles.sectionTitle}>
            View Options
          </Typography>
          <HStack spacing={8}>
            <TouchableOpacity onPress={handleToggleGrid} activeOpacity={0.8}>
              <Badge variant={showGrid ? 'primary' : 'default'} size="md">
                {showGrid ? '⊞ Grid On' : '⊞ Grid Off'}
              </Badge>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleVectors} activeOpacity={0.8}>
              <Badge variant={showVectors ? 'primary' : 'default'} size="md">
                {showVectors ? '⇢ Vectors On' : '⇢ Vectors Off'}
              </Badge>
            </TouchableOpacity>
          </HStack>
        </View>

        {parameters.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" style={styles.sectionTitle}>
              Parameters
            </Typography>
            <VStack spacing={12}>
              {parameters.map((param) => (
                <View key={param.id}>
                  <HStack justify="space-between" align="center">
                    <Typography variant="caption">{param.name}</Typography>
                    <Typography variant="caption" style={{ opacity: 0.7 }}>
                      {param.value.toFixed(2)}{param.unit || ''}
                    </Typography>
                  </HStack>
                  <View style={styles.sliderContainer}>
                    <View
                      style={[
                        styles.sliderTrack,
                        { backgroundColor: theme.colors.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.sliderFill,
                          {
                            backgroundColor: theme.colors.primary,
                            width: `${((param.value - param.min) / (param.max - param.min)) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <HStack justify="space-between">
                      <TouchableOpacity
                        onPress={() => handleParameterChange(param.id, Math.max(param.min, param.value - param.step))}
                        style={styles.sliderButton}
                      >
                        <Typography variant="caption">-</Typography>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleParameterChange(param.id, Math.min(param.max, param.value + param.step))}
                        style={styles.sliderButton}
                      >
                        <Typography variant="caption">+</Typography>
                      </TouchableOpacity>
                    </HStack>
                  </View>
                </View>
              ))}
            </VStack>
          </View>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    opacity: 0.6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playButton: {
    minWidth: 80,
  },
  toolButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 60,
  },
  sliderContainer: {
    marginTop: 4,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  sliderButton: {
    padding: 4,
    minWidth: 24,
    alignItems: 'center',
  },
});

SimulationControls.displayName = 'SimulationControls';
