import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Card } from '../atoms/Card';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface QuizOption {
  id: string;
  label: string;
  value: string;
  correct?: boolean;
  explanation?: string;
}

export interface QuizBlockProps {
  question: string;
  options: QuizOption[];
  questionNumber?: number;
  totalQuestions?: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  allowMultiple?: boolean;
  showCorrectAnswer?: boolean;
  selectedValues?: string[];
  onSelect?: (values: string[]) => void;
  explanation?: string;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Shuffle options */
  shuffle?: boolean;
  /** Show explanation immediately */
  showExplanation?: boolean;
}

export const QuizBlock: React.FC<QuizBlockProps> = ({
  question,
  options,
  questionNumber,
  totalQuestions,
  category,
  difficulty,
  allowMultiple = false,
  showCorrectAnswer = false,
  selectedValues = [],
  onSelect,
  explanation,
  style,
  isLoading,
  error,
  entity,
  shuffle = false,
  showExplanation = false,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const [selected, setSelected] = React.useState<string[]>(selectedValues);
  const [isAnswered, setIsAnswered] = React.useState(false);

  React.useEffect(() => {
    setSelected(selectedValues);
  }, [selectedValues]);

  const shuffledOptions = React.useMemo(() => {
    if (!shuffle) return options;
    return [...options].sort(() => Math.random() - 0.5);
  }, [options, shuffle]);

  const getDifficultyColor = (): import('../atoms/Badge').BadgeVariant => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOptionStyle = (option: QuizOption): {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  } => {
    const isSelected = selected.includes(option.value);

    if (showCorrectAnswer && isAnswered) {
      if (option.correct) {
        return {
          backgroundColor: theme.colors.success,
          borderColor: theme.colors.success,
          textColor: theme.colors['success-foreground'],
        };
      }
      if (isSelected && !option.correct) {
        return {
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error,
          textColor: theme.colors['error-foreground'],
        };
      }
    }

    if (isSelected) {
      return {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        textColor: theme.colors['primary-foreground'],
      };
    }

    return {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      textColor: theme.colors.foreground,
    };
  };

  const handleSelect = (option: QuizOption) => {
    if (showCorrectAnswer && isAnswered) return;

    let newSelected: string[];

    if (allowMultiple) {
      newSelected = selected.includes(option.value)
        ? selected.filter((v) => v !== option.value)
        : [...selected, option.value];
    } else {
      newSelected = selected.includes(option.value) ? [] : [option.value];
      setIsAnswered(true);
    }

    setSelected(newSelected);

    eventBus.emit('UI:QUIZ_ANSWER', {
      question,
      selected: newSelected,
      correct: option.correct,
      entity,
    });

    onSelect?.(newSelected);
  };

  const isCorrect = selected.length > 0 && selected.every((value) => {
    const option = options.find((o) => o.value === value);
    return option?.correct;
  }) && selected.length === options.filter((o) => o.correct).length;

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading question..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  return (
    <Card style={[styles.container, style as ViewStyle]} padding="lg">
      <VStack spacing={16}>
        {/* Header */}
        <HStack justify="space-between" align="center">
          {(questionNumber !== undefined || category) && (
            <HStack spacing={8} align="center">
              {questionNumber !== undefined && totalQuestions !== undefined && (
                <Badge variant="secondary" size="sm">
                  {questionNumber} / {totalQuestions}
                </Badge>
              )}
              {category && (
                <Badge variant="default" size="sm">
                  {category}
                </Badge>
              )}
            </HStack>
          )}
          {difficulty && (
            <Badge variant={getDifficultyColor()} size="sm">
              {difficulty}
            </Badge>
          )}
        </HStack>

        {/* Question */}
        <Typography variant="h4" style={{ color: theme.colors.foreground }}>
          {question}
        </Typography>

        {allowMultiple && (
          <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
            Select all that apply
          </Typography>
        )}

        {/* Options */}
        <VStack spacing={8}>
          {shuffledOptions.map((option) => {
            const style = getOptionStyle(option);
            const isSelected = selected.includes(option.value);

            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleSelect(option)}
                activeOpacity={0.8}
                style={[
                  styles.option,
                  {
                    backgroundColor: style.backgroundColor,
                    borderColor: style.borderColor,
                  },
                ]}
              >
                <HStack spacing={12} align="center">
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: isSelected ? style.textColor : theme.colors.border,
                        backgroundColor: isSelected ? style.textColor : 'transparent',
                      },
                      allowMultiple ? styles.checkboxSquare : styles.checkboxCircle,
                    ]}
                  >
                    {isSelected && (
                      <Typography variant="caption" style={{ color: style.backgroundColor, fontWeight: '700' }}>
                        ✓
                      </Typography>
                    )}
                  </View>
                  <Typography variant="body" style={{ color: style.textColor, flex: 1 }}>
                    {option.label}
                  </Typography>
                  {showCorrectAnswer && isAnswered && option.correct && (
                    <Badge variant="success" size="sm">
                      Correct
                    </Badge>
                  )}
                </HStack>
              </TouchableOpacity>
            );
          })}
        </VStack>

        {/* Result */}
        {showCorrectAnswer && isAnswered && (
          <View style={styles.resultContainer}>
            <Badge variant={isCorrect ? 'success' : 'error'} size="md">
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </Badge>
          </View>
        )}

        {/* Explanation */}
        {(showExplanation || (showCorrectAnswer && isAnswered)) && (explanation || options.some((o) => o.explanation && selected.includes(o.value))) && (
          <View style={[styles.explanationContainer, { backgroundColor: theme.colors.muted }]}>
            <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
              {explanation || options.find((o) => o.explanation && selected.includes(o.value))?.explanation}
            </Typography>
          </View>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  option: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquare: {
    borderRadius: 4,
  },
  checkboxCircle: {
    borderRadius: 12,
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  explanationContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});

QuizBlock.displayName = 'QuizBlock';
