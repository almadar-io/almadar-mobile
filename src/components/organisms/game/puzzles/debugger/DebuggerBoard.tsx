/**
 * DebuggerBoard
 *
 * Error-finding game board. The player reviews a code/system
 * listing and identifies lines or elements that contain bugs.
 *
 * Good for: programming, logic, troubleshooting stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { Card } from '../../../../atoms/Card';
import { Button } from '../../../../atoms/Button';
import { Typography } from '../../../../atoms/Typography';
import { VStack, HStack } from '../../../../atoms/Stack';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';

export interface DebuggerLine {
  id: string;
  content: string;
  isBug: boolean;
  explanation?: string;
}

export interface DebuggerPuzzleEntity {
  id: string;
  title: string;
  description: string;
  language?: string;
  lines: DebuggerLine[];
  /** How many bugs the player should find */
  bugCount: number;
  successMessage?: string;
  failMessage?: string;
  hint?: string;
  /** Header image URL displayed above the title */
  headerImage?: string;
  /** Visual theme overrides */
  theme?: { background?: string; accentColor?: string };
}

export interface DebuggerBoardProps {
  entity: DebuggerPuzzleEntity;
  completeEvent?: string;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
}

export const DebuggerBoard: React.FC<DebuggerBoardProps> = ({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const [flaggedLines, setFlaggedLines] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const toggleLine = (lineId: string) => {
    if (submitted) return;
    setFlaggedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  };

  const bugLines = entity.lines.filter((l) => l.isBug);
  const correctFlags = entity.lines.filter((l) => l.isBug && flaggedLines.has(l.id));
  const falseFlags = entity.lines.filter((l) => !l.isBug && flaggedLines.has(l.id));
  const allCorrect = submitted && correctFlags.length === bugLines.length && falseFlags.length === 0;

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct = correctFlags.length === bugLines.length && falseFlags.length === 0;
    if (correct) {
      eventBus.emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  }, [correctFlags.length, bugLines.length, falseFlags.length, attempts, completeEvent, eventBus]);

  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && entity.hint) {
      setShowHint(true);
    }
  };

  const handleFullReset = () => {
    setFlaggedLines(new Set());
    setSubmitted(false);
    setAttempts(0);
    setShowHint(false);
  };

  const getLineBackgroundColor = (line: DebuggerLine, isFlagged: boolean): string | undefined => {
    if (submitted) {
      if (line.isBug && isFlagged) return `${theme.colors.success}20`;
      if (line.isBug && !isFlagged) return `${theme.colors.warning}20`;
      if (!line.isBug && isFlagged) return `${theme.colors.error}20`;
    } else if (isFlagged) {
      return `${theme.colors.error}20`;
    }
    return undefined;
  };

  if (isLoading) {
    return <LoadingState message="Loading puzzle..." />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <ScrollView style={[styles.container, style]}>
      <VStack spacing={16} style={styles.content}>
        {/* Title Card */}
        <Card>
          <VStack spacing={8}>
            <HStack spacing={8} align="center">
              <Text style={{ fontSize: 20 }}>🐛</Text>
              <Typography variant="h4">{entity.title}</Typography>
            </HStack>
            <Typography variant="body">{entity.description}</Typography>
            <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
              Find {entity.bugCount} bug{entity.bugCount !== 1 ? 's' : ''} in the code below
            </Typography>
          </VStack>
        </Card>

        {/* Code listing */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <VStack spacing={0}>
            {entity.lines.map((line, index) => {
              const isFlagged = flaggedLines.has(line.id);
              const bgColor = getLineBackgroundColor(line, isFlagged);

              return (
                <TouchableOpacity
                  key={line.id}
                  onPress={() => toggleLine(line.id)}
                  disabled={submitted}
                  style={[
                    styles.lineRow,
                    { backgroundColor: bgColor },
                    index < entity.lines.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                  ]}
                >
                  <View style={[styles.lineNumber, { borderRightColor: theme.colors.border }]}>
                    <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                      {index + 1}
                    </Typography>
                  </View>
                  <View style={styles.lineContent}>
                    <Typography variant="body" style={styles.codeText}>
                      {line.content}
                    </Typography>
                  </View>
                  <View style={styles.lineIndicator}>
                    {isFlagged && <Text style={{ color: theme.colors.error }}>🐛</Text>}
                    {submitted && line.isBug && !isFlagged && (
                      <Text style={{ color: theme.colors.warning }}>🐛</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </VStack>
        </Card>

        {/* Explanations after submit */}
        {submitted && (
          <Card>
            <VStack spacing={12}>
              <Typography variant="body" style={{ fontWeight: '600' }}>
                {allCorrect
                  ? (entity.successMessage ?? 'All bugs found!')
                  : `${correctFlags.length}/${bugLines.length} bugs found`}
              </Typography>
              {bugLines.map((line) => (
                <HStack key={line.id} spacing={8} align="flex-start">
                  <Text style={{ marginTop: 2 }}>
                    {flaggedLines.has(line.id) ? '✅' : '⚠️'}
                  </Text>
                  <VStack spacing={4}>
                    <Typography variant="caption" style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                      {line.content.trim()}
                    </Typography>
                    {line.explanation && (
                      <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                        {line.explanation}
                      </Typography>
                    )}
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Card>
        )}

        {showHint && entity.hint && (
          <Card style={{ borderLeftWidth: 4, borderLeftColor: theme.colors.warning }}>
            <Typography variant="body">💡 {entity.hint}</Typography>
          </Card>
        )}

        <HStack spacing={8} justify="center">
          {!submitted ? (
            <Button variant="primary" onPress={handleSubmit} disabled={flaggedLines.size === 0}>
              📤 Submit
            </Button>
          ) : !allCorrect ? (
            <Button variant="primary" onPress={handleReset}>
              Try Again
            </Button>
          ) : null}
          <Button variant="secondary" onPress={handleFullReset}>
            🔄 Reset
          </Button>
        </HStack>
      </VStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  lineNumber: {
    width: 40,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  lineContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  lineIndicator: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

DebuggerBoard.displayName = 'DebuggerBoard';
