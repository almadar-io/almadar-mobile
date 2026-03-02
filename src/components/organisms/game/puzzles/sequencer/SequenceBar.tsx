import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { Card } from '../../../../atoms/Card';
import { Badge } from '../../../../atoms/Badge';
import { Button } from '../../../../atoms/Button';
import { Typography } from '../../../../atoms/Typography';
import { HStack, VStack } from '../../../../atoms/Stack';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';

export interface SequenceStep {
  id: string;
  actionId: string;
  actionName: string;
  icon?: string;
  params?: Record<string, unknown>;
  isActive?: boolean;
}

export interface SequenceBarProps {
  steps: SequenceStep[];
  currentStep?: number;
  isPlaying?: boolean;
  onStepPress?: (step: SequenceStep, index: number) => void;
  onStepRemove?: (stepId: string, index: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onClear?: () => void;
  maxSteps?: number;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const SequenceBar: React.FC<SequenceBarProps> = ({
  steps,
  currentStep = -1,
  isPlaying = false,
  onStepPress,
  onStepRemove,
  onPlay,
  onPause,
  onStop,
  onClear,
  maxSteps = 10,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const scrollRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    if (currentStep >= 0 && scrollRef.current) {
      const offset = currentStep * 72;
      scrollRef.current.scrollTo({ x: offset, animated: true });
    }
  }, [currentStep]);

  const handleStepPress = (step: SequenceStep, index: number) => {
    eventBus.emit('UI:SEQUENCE_STEP_PRESSED', { step, index });
    onStepPress?.(step, index);
  };

  const handleStepRemove = (stepId: string, index: number) => {
    eventBus.emit('UI:SEQUENCE_STEP_REMOVED', { stepId, index });
    onStepRemove?.(stepId, index);
  };

  const handlePlay = () => {
    eventBus.emit('UI:SEQUENCE_PLAY', { steps });
    onPlay?.();
  };

  const handlePause = () => {
    eventBus.emit('UI:SEQUENCE_PAUSE', {});
    onPause?.();
  };

  const handleStop = () => {
    eventBus.emit('UI:SEQUENCE_STOP', {});
    onStop?.();
  };

  const handleClear = () => {
    eventBus.emit('UI:SEQUENCE_CLEAR', {});
    onClear?.();
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading sequence..." />
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
      <View style={styles.header}>
        <HStack justify="space-between" align="center">
          <Typography variant="h4">Sequence</Typography>
          <Badge variant="default" size="sm">
            {steps.length}/{maxSteps}
          </Badge>
        </HStack>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sequenceScroll}
        contentContainerStyle={styles.sequenceContainer}
      >
        {steps.length === 0 ? (
          <View style={styles.emptyState}>
            <Typography variant="caption" style={{ opacity: 0.5 }}>
              Drag actions here to build a sequence
            </Typography>
          </View>
        ) : (
          <HStack spacing={8}>
            {steps.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                onPress={() => handleStepPress(step, index)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.stepCard,
                    {
                      backgroundColor:
                        index === currentStep
                          ? theme.colors.primary + '30'
                          : step.isActive
                            ? theme.colors.surface
                            : theme.colors.muted,
                      borderColor:
                        index === currentStep
                          ? theme.colors.primary
                          : theme.colors.border,
                      borderWidth: index === currentStep ? 2 : 1,
                    },
                  ]}
                >
                  <VStack align="center" spacing={4}>
                    <View
                      style={[
                        styles.stepNumber,
                        {
                          backgroundColor:
                            index === currentStep
                              ? theme.colors.primary
                              : theme.colors.border,
                        },
                      ]}
                    >
                      <Typography variant="caption" style={{ color: theme.colors.card, fontWeight: '700' }}>
                        {index + 1}
                      </Typography>
                    </View>

                    {step.icon && (
                      <Typography variant="body">{step.icon}</Typography>
                    )}

                    <Typography
                      variant="caption"
                      style={{
                        fontWeight: '600',
                        textAlign: 'center',
                        maxWidth: 60,
                      }}
                      numberOfLines={1}
                    >
                      {step.actionName}
                    </Typography>

                    {isPlaying && index === currentStep && (
                      <View style={styles.playingIndicator}>
                        <View style={[styles.playingDot, { backgroundColor: theme.colors.success }]} />
                      </View>
                    )}
                  </VStack>

                  {onStepRemove && (
                    <TouchableOpacity
                      onPress={() => handleStepRemove(step.id, index)}
                      style={styles.removeButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Typography variant="caption" style={{ color: theme.colors.error }}>
                        ×
                      </Typography>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </HStack>
        )}
      </ScrollView>

      <View style={[styles.controls, { borderTopColor: theme.colors.border }]}>
        <HStack spacing={8} justify="center">
          {!isPlaying ? (
            <Button
              variant="primary"
              size="sm"
              onPress={handlePlay}
              disabled={steps.length === 0}
            >
              ▶ Play
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onPress={handlePause}>
              ⏸ Pause
            </Button>
          )}

          <Button variant="secondary" size="sm" onPress={handleStop}>
            ⏹ Stop
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onPress={handleClear}
            disabled={steps.length === 0}
          >
            Clear
          </Button>
        </HStack>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  sequenceScroll: {
    maxHeight: 120,
    paddingVertical: 8,
  },
  sequenceContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: '100%',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 300,
  },
  stepCard: {
    width: 72,
    minHeight: 90,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingIndicator: {
    flexDirection: 'row',
    gap: 2,
  },
  playingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    padding: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  controls: {
    padding: 12,
    borderTopWidth: 1,
  },
});

SequenceBar.displayName = 'SequenceBar';
