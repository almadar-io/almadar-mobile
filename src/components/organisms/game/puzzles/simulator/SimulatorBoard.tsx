/**
 * SimulatorBoard
 *
 * Parameter-slider simulation puzzle for React Native.
 * The player adjusts parameters and observes real-time output.
 * Correct parameter values must bring the output within a target range to win.
 *
 * Good for: physics, economics, system design stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { Card } from '../../../../atoms/Card';
import { Button } from '../../../../atoms/Button';
import { Typography } from '../../../../atoms/Typography';
import { Badge } from '../../../../atoms/Badge';
import { VStack, HStack } from '../../../../atoms/Stack';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';

export interface SimulatorParameter {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  correct: number;
  tolerance: number;
}

export interface SimulatorPuzzleEntity {
  id: string;
  title: string;
  description: string;
  parameters: SimulatorParameter[];
  outputLabel: string;
  outputUnit: string;
  /** Pure function body as string: receives params object, returns number */
  computeExpression: string;
  targetValue: number;
  targetTolerance: number;
  successMessage?: string;
  failMessage?: string;
  hint?: string;
}

export interface SimulatorBoardProps {
  /** Puzzle data */
  entity: SimulatorPuzzleEntity;
  /** Event name emitted on completion */
  completeEvent?: string;
  /** Additional styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entityName?: string;
}

export const SimulatorBoard: React.FC<SimulatorBoardProps> = ({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  style,
  isLoading,
  error,
}) => {
  useTheme();
  const eventBus = useEventBus();

  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const p of entity.parameters) {
      init[p.id] = p.initial;
    }
    return init;
  });
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const computeOutput = useCallback(
    (params: Record<string, number>): number => {
      try {
        const fn = new Function('params', `return (${entity.computeExpression})`);
        return fn(params) as number;
      } catch {
        return 0;
      }
    },
    [entity.computeExpression],
  );

  const output = useMemo(() => computeOutput(values), [computeOutput, values]);
  const isCorrect = Math.abs(output - entity.targetValue) <= entity.targetTolerance;

  const handleParameterChange = (id: string, value: number) => {
    if (submitted) return;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    if (isCorrect) {
      eventBus.emit(`UI:${completeEvent}`, {
        success: true,
        attempts: attempts + 1,
        output,
      });
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && entity.hint) {
      setShowHint(true);
    }
  };

  const handleFullReset = () => {
    const init: Record<string, number> = {};
    for (const p of entity.parameters) {
      init[p.id] = p.initial;
    }
    setValues(init);
    setSubmitted(false);
    setAttempts(0);
    setShowHint(false);
    eventBus.emit('UI:SIMULATOR_RESET');
  };

  // Calculate slider track percentage
  const getSliderPercent = (param: SimulatorParameter) => {
    const value = values[param.id];
    return ((value - param.min) / (param.max - param.min)) * 100;
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading simulation..." />
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack spacing={16}>
          {/* Header */}
          <VStack spacing={4}>
            <Typography variant="h4" style={{ color: '#fff' }}>
              {entity.title}
            </Typography>
            <Text style={styles.description}>{entity.description}</Text>
          </VStack>

          {/* Parameter sliders */}
          <View style={styles.parametersCard}>
            <Text style={styles.sectionLabel}>Parameters</Text>
            <VStack spacing={16}>
              {entity.parameters.map((param) => (
                <VStack key={param.id} spacing={8}>
                  <HStack align="center" justify="space-between">
                    <Text style={styles.paramLabel}>{param.label}</Text>
                    <Badge size="sm" variant="primary">
                      {values[param.id]} {param.unit}
                    </Badge>
                  </HStack>

                  {/* Custom slider visualization */}
                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderTrack}>
                      <View
                        style={[
                          styles.sliderFill,
                          { width: `${getSliderPercent(param)}%` },
                        ]}
                      />
                    </View>

                    {/* Step buttons for discrete control */}
                    <HStack spacing={4} style={styles.stepButtons}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() =>
                          handleParameterChange(
                            param.id,
                            Math.max(param.min, values[param.id] - param.step),
                          )
                        }
                        disabled={submitted || values[param.id] <= param.min}
                      >
                        -
                      </Button>

                      {/* Value indicator buttons */}
                      {Array.from(
                        { length: Math.floor((param.max - param.min) / param.step) + 1 },
                        (_, i) => param.min + i * param.step,
                      ).map((stepValue) => (
                        <TouchableOpacity
                          key={stepValue}
                          onPress={() => handleParameterChange(param.id, stepValue)}
                          disabled={submitted}
                          style={[
                            styles.stepDot,
                            values[param.id] === stepValue && styles.activeStepDot,
                          ]}
                        />
                      ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() =>
                          handleParameterChange(
                            param.id,
                            Math.min(param.max, values[param.id] + param.step),
                          )
                        }
                        disabled={submitted || values[param.id] >= param.max}
                      >
                        +
                      </Button>
                    </HStack>
                  </View>

                  <HStack justify="space-between">
                    <Text style={styles.rangeLabel}>
                      {param.min} {param.unit}
                    </Text>
                    <Text style={styles.rangeLabel}>
                      {param.max} {param.unit}
                    </Text>
                  </HStack>
                </VStack>
              ))}
            </VStack>
          </View>

          {/* Output display */}
          <View style={styles.outputCard}>
            <VStack spacing={8} align="center">
              <Text style={styles.outputLabel}>{entity.outputLabel}</Text>
              <Text
                style={[
                  styles.outputValue,
                  submitted && isCorrect && styles.correctOutput,
                  submitted && !isCorrect && styles.wrongOutput,
                ]}
              >
                {output.toFixed(2)} {entity.outputUnit}
              </Text>
              {submitted && (
                <HStack spacing={4} align="center">
                  <Text style={isCorrect ? styles.correctText : styles.wrongText}>
                    {isCorrect ? '✅ ' : '❌ '}
                  </Text>
                  <Text style={isCorrect ? styles.correctText : styles.wrongText}>
                    {isCorrect
                      ? entity.successMessage ?? 'Correct!'
                      : entity.failMessage ?? 'Incorrect'}
                  </Text>
                </HStack>
              )}
              <Text style={styles.targetText}>
                Target: {entity.targetValue} {entity.outputUnit} (±
                {entity.targetTolerance})
              </Text>
            </VStack>
          </View>

          {/* Hint */}
          {showHint && entity.hint && (
            <View style={styles.hintCard}>
              <Text style={styles.hintText}>💡 {entity.hint}</Text>
            </View>
          )}

          {/* Attempts counter */}
          {attempts > 0 && (
            <Text style={styles.attemptsText}>Attempts: {attempts}</Text>
          )}

          {/* Actions */}
          <HStack spacing={8}>
            {!submitted ? (
              <Button variant="primary" onPress={handleSubmit}>
                ▶ Simulate
              </Button>
            ) : !isCorrect ? (
              <Button variant="primary" onPress={handleReset}>
                Try Again
              </Button>
            ) : null}
            <Button variant="secondary" onPress={handleFullReset}>
              ↺ Reset
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </Card>
  );
};



const styles = StyleSheet.create({
  container: {
    padding: 16,
    maxHeight: 700,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
  parametersCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  paramLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sliderContainer: {
    gap: 8,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#14b8a6',
  },
  stepButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4b5563',
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: '#14b8a6',
    transform: [{ scale: 1.2 }],
  },
  rangeLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  outputCard: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 12,
  },
  outputLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  outputValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  correctOutput: {
    color: '#22c55e',
  },
  wrongOutput: {
    color: '#ef4444',
  },
  correctText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  wrongText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  targetText: {
    color: '#6b7280',
    fontSize: 12,
  },
  hintCard: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#eab308',
    padding: 12,
    borderRadius: 8,
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
  },
  attemptsText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
});

SimulatorBoard.displayName = 'SimulatorBoard';
