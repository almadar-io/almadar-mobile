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
import { ProgressBar } from '../atoms/ProgressBar';
import { HStack, VStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface WizardProgressStep {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
}

export interface WizardProgressProps {
  steps: WizardProgressStep[];
  currentStep: number;
  onStepPress?: (stepIndex: number) => void;
  allowNavigation?: boolean;
  variant?: 'dots' | 'bar' | 'numbers';
  showLabels?: boolean;
  showDescriptions?: boolean;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  steps,
  currentStep,
  onStepPress,
  allowNavigation = true,
  variant = 'dots',
  showLabels = true,
  showDescriptions = false,
  style,
  isLoading,
  error,
  entity,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleStepPress = (index: number) => {
    if (!allowNavigation) return;
    if (index > currentStep) return; // Can only go back or stay

    eventBus.emit('UI:WIZARD_STEP_CHANGE', { step: index, entity });
    onStepPress?.(index);
  };

  const getStepStatus = (index: number): 'pending' | 'active' | 'completed' => {
    if (index === currentStep) return 'active';
    if (index < currentStep) return 'completed';
    return 'pending';
  };

  const getStepColor = (status: 'pending' | 'active' | 'completed') => {
    switch (status) {
      case 'completed':
        return {
          background: theme.colors.success,
          text: theme.colors['success-foreground'],
          border: theme.colors.success,
        };
      case 'active':
        return {
          background: theme.colors.primary,
          text: theme.colors['primary-foreground'],
          border: theme.colors.primary,
        };
      case 'pending':
      default:
        return {
          background: theme.colors.muted,
          text: theme.colors['muted-foreground'],
          border: theme.colors.border,
        };
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading..." />
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

  const renderDots = () => (
    <HStack spacing={8} justify="center" style={styles.dotsContainer}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const colors = getStepColor(status);
        const canPress = allowNavigation && index <= currentStep;

        return (
          <TouchableOpacity
            key={step.id}
            onPress={() => handleStepPress(index)}
            disabled={!canPress}
            style={[
              styles.dot,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
              canPress && styles.clickableDot,
            ]}
            activeOpacity={0.8}
          >
            {status === 'completed' ? (
              <Typography variant="caption" style={{ color: colors.text, fontWeight: '700' }}>
                ✓
              </Typography>
            ) : (
              <View style={[styles.dotInner, { backgroundColor: colors.background }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </HStack>
  );

  const renderNumbers = () => (
    <HStack spacing={12} justify="center" style={styles.numbersContainer}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const colors = getStepColor(status);
        const canPress = allowNavigation && index <= currentStep;

        return (
          <TouchableOpacity
            key={step.id}
            onPress={() => handleStepPress(index)}
            disabled={!canPress}
            activeOpacity={0.8}
            style={styles.numberStepContainer}
          >
            <VStack align="center" spacing={4}>
              <View
                style={[
                  styles.numberCircle,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                  canPress && styles.clickableNumber,
                ]}
              >
                <Typography variant="body" style={{ color: colors.text, fontWeight: '600' }}>
                  {status === 'completed' ? '✓' : index + 1}
                </Typography>
              </View>
              {showLabels && (
                <Typography
                  variant="caption"
                  style={{
                    color: status === 'active' ? theme.colors.foreground : theme.colors['muted-foreground'],
                    fontWeight: status === 'active' ? '600' : '400',
                    textAlign: 'center',
                    maxWidth: 80,
                  }}
                  numberOfLines={1}
                >
                  {step.title}
                </Typography>
              )}
              {showDescriptions && step.description && (
                <Typography
                  variant="caption"
                  style={{
                    color: theme.colors['muted-foreground'],
                    fontSize: 10,
                    textAlign: 'center',
                    maxWidth: 80,
                  }}
                  numberOfLines={1}
                >
                  {step.description}
                </Typography>
              )}
              {step.optional && (
                <Typography
                  variant="caption"
                  style={{
                    color: theme.colors['muted-foreground'],
                    fontSize: 10,
                    fontStyle: 'italic',
                  }}
                >
                  (Optional)
                </Typography>
              )}
            </VStack>
          </TouchableOpacity>
        );
      })}
    </HStack>
  );

  const renderBar = () => (
    <VStack spacing={8} style={styles.barContainer}>
      <ProgressBar progress={progress} showLabel={false} size="md" />
      {showLabels && (
        <HStack justify="space-between">
          <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
            Step {currentStep + 1} of {steps.length}
          </Typography>
          <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
            {Math.round(progress)}%
          </Typography>
        </HStack>
      )}
      {showLabels && (
        <Typography
          variant="body"
          style={{ color: theme.colors.foreground, textAlign: 'center', marginTop: 4 }}
        >
          {steps[currentStep]?.title}
        </Typography>
      )}
      {showDescriptions && steps[currentStep]?.description && (
        <Typography
          variant="caption"
          style={{ color: theme.colors['muted-foreground'], textAlign: 'center' }}
        >
          {steps[currentStep].description}
        </Typography>
      )}
    </VStack>
  );

  return (
    <View style={[styles.container, style as ViewStyle]}>
      {variant === 'dots' && renderDots()}
      {variant === 'numbers' && renderNumbers()}
      {variant === 'bar' && renderBar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dotsContainer: {
    paddingVertical: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  clickableDot: {
    transform: [{ scale: 1.1 }],
  },
  numbersContainer: {
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  numberStepContainer: {
    alignItems: 'center',
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickableNumber: {
    transform: [{ scale: 1.05 }],
  },
  barContainer: {
    paddingVertical: 8,
  },
});

WizardProgress.displayName = 'WizardProgress';
