import React from 'react';
import { 
  View, 
  TouchableOpacity,
  ScrollView,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isValid?: boolean;
}

export interface WizardContainerProps {
  steps: WizardStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  onCancel?: () => void;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({
  steps,
  currentStep: controlledStep,
  onStepChange,
  onComplete,
  onCancel,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [internalStep, setInternalStep] = React.useState(0);
  const currentStep = controlledStep ?? internalStep;

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = step?.isValid !== false;

  const handleNext = () => {
    if (isLastStep) {
      eventBus.emit('UI:WIZARD_COMPLETE');
      onComplete?.();
    } else {
      const nextStep = currentStep + 1;
      eventBus.emit('UI:WIZARD_STEP_CHANGE', { step: nextStep });
      setInternalStep(nextStep);
      onStepChange?.(nextStep);
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      eventBus.emit('UI:WIZARD_CANCEL');
      onCancel?.();
    } else {
      const prevStep = currentStep - 1;
      eventBus.emit('UI:WIZARD_STEP_CHANGE', { step: prevStep });
      setInternalStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  const handleStepClick = (index: number) => {
    if (index <= currentStep) {
      eventBus.emit('UI:WIZARD_STEP_CHANGE', { step: index });
      setInternalStep(index);
      onStepChange?.(index);
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

  return (
    <VStack spacing={16} style={[styles.container, style as ViewStyle]}>
      {/* Progress indicator */}
      <HStack spacing={8} style={styles.progress}>
        {steps.map((s, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => handleStepClick(index)}
              style={[
                styles.stepIndicator,
                {
                  backgroundColor: isActive 
                    ? theme.colors.primary 
                    : isCompleted 
                      ? theme.colors.success 
                      : theme.colors.muted,
                },
              ]}
            >
              <Typography 
                variant="caption" 
                style={{ 
                  color: isActive || isCompleted 
                    ? theme.colors['primary-foreground'] 
                    : theme.colors.foreground 
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </HStack>

      {/* Step title */}
      <VStack spacing={4} align="center">
        <Typography variant="h4" style={{ color: theme.colors.foreground }}>
          {step?.title}
        </Typography>
        {step?.description && (
          <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
            {step.description}
          </Typography>
        )}
      </VStack>

      {/* Step content */}
      <ScrollView style={styles.content}>
        {step?.content}
      </ScrollView>

      {/* Navigation buttons */}
      <HStack spacing={12} justify="space-between">
        <Button
          variant="ghost"
          onPress={handleBack}
          action={isFirstStep ? 'WIZARD_CANCEL' : undefined}
        >
          {isFirstStep ? 'Cancel' : 'Back'}
        </Button>
        <Button
          variant="primary"
          onPress={handleNext}
          disabled={!canProceed}
          action={isLastStep ? 'WIZARD_COMPLETE' : 'WIZARD_NEXT'}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </Button>
      </HStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  progress: {
    justifyContent: 'center',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
});

WizardContainer.displayName = 'WizardContainer';
