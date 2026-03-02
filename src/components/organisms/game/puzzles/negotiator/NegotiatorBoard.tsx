/**
 * NegotiatorBoard
 *
 * Turn-based decision matrix game for React Native. The player makes choices
 * over multiple rounds against an AI opponent. Each round both sides pick
 * an action, and payoffs are determined by the combination.
 *
 * Good for: ethics, business, game theory, economics stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

import React, { useState, useCallback } from 'react';
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

export interface NegotiatorAction {
  id: string;
  label: string;
  description?: string;
}

export interface PayoffEntry {
  playerAction: string;
  opponentAction: string;
  playerPayoff: number;
  opponentPayoff: number;
}

export interface NegotiatorPuzzleEntity {
  id: string;
  title: string;
  description: string;
  actions: NegotiatorAction[];
  payoffMatrix: PayoffEntry[];
  totalRounds: number;
  /** AI strategy: 'tit-for-tat' | 'always-cooperate' | 'always-defect' | 'random' */
  opponentStrategy: string;
  targetScore: number;
  successMessage?: string;
  failMessage?: string;
  hint?: string;
}

export interface NegotiatorBoardProps {
  /** Puzzle data */
  entity: NegotiatorPuzzleEntity;
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

interface RoundResult {
  round: number;
  playerAction: string;
  opponentAction: string;
  playerPayoff: number;
  opponentPayoff: number;
}

function getOpponentAction(
  strategy: string,
  actions: NegotiatorAction[],
  history: RoundResult[],
): string {
  const actionIds = actions.map((a) => a.id);
  switch (strategy) {
    case 'always-cooperate':
      return actionIds[0];
    case 'always-defect':
      return actionIds[actionIds.length - 1];
    case 'tit-for-tat':
      if (history.length === 0) return actionIds[0];
      return history[history.length - 1].playerAction;
    case 'random':
    default:
      return actionIds[Math.floor(Math.random() * actionIds.length)];
  }
}

export const NegotiatorBoard: React.FC<NegotiatorBoardProps> = ({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  style,
  isLoading,
  error,
}) => {
  useTheme();
  const eventBus = useEventBus();

  const [history, setHistory] = useState<RoundResult[]>([]);
  const [showHint, setShowHint] = useState(false);

  const currentRound = history.length;
  const isComplete = currentRound >= entity.totalRounds;
  const playerTotal = history.reduce((s, r) => s + r.playerPayoff, 0);
  const opponentTotal = history.reduce((s, r) => s + r.opponentPayoff, 0);
  const won = isComplete && playerTotal >= entity.targetScore;

  const handleAction = useCallback((actionId: string) => {
    if (isComplete) return;
    const opponentAction = getOpponentAction(entity.opponentStrategy, entity.actions, history);
    const payoff = entity.payoffMatrix.find(
      (p) => p.playerAction === actionId && p.opponentAction === opponentAction,
    );
    const result: RoundResult = {
      round: currentRound + 1,
      playerAction: actionId,
      opponentAction,
      playerPayoff: payoff?.playerPayoff ?? 0,
      opponentPayoff: payoff?.opponentPayoff ?? 0,
    };
    const newHistory = [...history, result];
    setHistory(newHistory);

    if (newHistory.length >= entity.totalRounds) {
      const total = newHistory.reduce((s, r) => s + r.playerPayoff, 0);
      if (total >= entity.targetScore) {
        eventBus.emit(`UI:${completeEvent}`, { success: true, score: total });
      }
      if (newHistory.length >= 3 && entity.hint) {
        setShowHint(true);
      }
    }
  }, [isComplete, entity, history, currentRound, completeEvent, eventBus]);

  const handleReset = () => {
    setHistory([]);
    setShowHint(false);
    eventBus.emit('UI:NEGOTIATOR_RESET');
  };

  const getActionLabel = (id: string) =>
    entity.actions.find((a) => a.id === id)?.label ?? id;

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading puzzle..." />
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
          <View style={styles.header}>
            <Typography variant="h4" style={{ color: '#fff' }}>
              {entity.title}
            </Typography>
            <Text style={styles.description}>{entity.description}</Text>
            <HStack spacing={8}>
              <Badge size="sm" variant="secondary">
                Round {currentRound}/{entity.totalRounds}
              </Badge>
              <Badge size="sm" variant="primary">
                Target: {entity.targetScore}
              </Badge>
            </HStack>
          </View>

          {/* Score Board */}
          <HStack spacing={12}>
            <View style={[styles.scoreCard, styles.playerScore]}>
              <VStack spacing={4} align="center">
                <Text style={styles.scoreLabel}>You</Text>
                <Text style={styles.scoreValue}>{playerTotal}</Text>
              </VStack>
            </View>
            <View style={[styles.scoreCard, styles.opponentScore]}>
              <VStack spacing={4} align="center">
                <Text style={styles.scoreLabel}>Opponent</Text>
                <Text style={styles.scoreValue}>{opponentTotal}</Text>
              </VStack>
            </View>
          </HStack>

          {/* Action buttons */}
          {!isComplete && (
            <View style={styles.actionsSection}>
              <Text style={styles.sectionLabel}>Choose your action:</Text>
              <HStack spacing={8} style={styles.actionsRow}>
                {entity.actions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    onPress={() => handleAction(action.id)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    {action.description && (
                      <Text style={styles.actionDesc} numberOfLines={2}>
                        {action.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </HStack>
            </View>
          )}

          {/* History */}
          {history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionLabel}>History</Text>
              <VStack spacing={8}>
                {history.map((round) => (
                  <HStack
                    key={round.round}
                    spacing={8}
                    align="center"
                    style={styles.historyRow}
                  >
                    <Badge size="sm" variant="secondary">
                      R{round.round}
                    </Badge>
                    <Text style={styles.historyText}>
                      {getActionLabel(round.playerAction)}
                    </Text>
                    <Text style={styles.historyVs}>vs</Text>
                    <Text style={styles.historyText}>
                      {getActionLabel(round.opponentAction)}
                    </Text>
                    <Text style={styles.payoffArrow}>→</Text>
                    <Text style={styles.playerPayoff}>+{round.playerPayoff}</Text>
                    <Text style={styles.opponentPayoff}>/+{round.opponentPayoff}</Text>
                  </HStack>
                ))}
              </VStack>
            </View>
          )}

          {/* Result */}
          {isComplete && (
            <View
              style={[
                styles.resultCard,
                won ? styles.successResult : styles.failResult,
              ]}
            >
              <VStack spacing={8} align="center">
                <Text style={styles.resultIcon}>{won ? '✅' : '❌'}</Text>
                <Text style={styles.resultText}>
                  {won
                    ? entity.successMessage ?? 'Success!'
                    : entity.failMessage ?? 'Failed!'}
                </Text>
                <Text style={styles.finalScore}>
                  Final Score: {playerTotal}/{entity.targetScore}
                </Text>
              </VStack>
            </View>
          )}

          {/* Hint */}
          {showHint && entity.hint && !won && (
            <View style={styles.hintCard}>
              <Text style={styles.hintText}>💡 {entity.hint}</Text>
            </View>
          )}

          {/* Reset button on failure */}
          {isComplete && !won && (
            <Button variant="primary" onPress={handleReset}>
              Play Again
            </Button>
          )}
        </VStack>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    maxHeight: 600,
  },
  header: {
    gap: 8,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
  scoreCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  playerScore: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  opponentScore: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  scoreLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scoreValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  actionsSection: {
    gap: 12,
  },
  sectionLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  actionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionDesc: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  historySection: {
    gap: 8,
  },
  historyRow: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  historyText: {
    color: '#fff',
    fontSize: 12,
  },
  historyVs: {
    color: '#6b7280',
    fontSize: 12,
  },
  payoffArrow: {
    color: '#6b7280',
    fontSize: 12,
  },
  playerPayoff: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  opponentPayoff: {
    color: '#6b7280',
    fontSize: 12,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  successResult: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  failResult: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  resultIcon: {
    fontSize: 32,
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalScore: {
    color: '#9ca3af',
    fontSize: 14,
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
});

NegotiatorBoard.displayName = 'NegotiatorBoard';
