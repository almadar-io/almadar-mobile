import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useEventBus } from '../../hooks/useEventBus';
import { Button } from '../atoms/Button';
import { HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface WizardNavigationAction {
  label: string;
  event?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  disabled?: boolean;
  hidden?: boolean;
}

export interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isComplete?: boolean;
  backLabel?: string;
  nextLabel?: string;
  cancelLabel?: string;
  completeLabel?: string;
  customActions?: WizardNavigationAction[];
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Show cancel button on first step */
  showCancel?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onCancel,
  onComplete,
  canGoBack = true,
  canGoNext = true,
  isComplete = false,
  backLabel = 'Back',
  nextLabel = 'Next',
  cancelLabel = 'Cancel',
  completeLabel = 'Complete',
  customActions,
  style,
  isLoading,
  error,
  entity,
  showCancel = true,
}) => {
  const eventBus = useEventBus();
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleBack = () => {
    if (isFirstStep) {
      eventBus.emit('UI:WIZARD_CANCEL', { step: currentStep, entity });
      onCancel?.();
    } else {
      eventBus.emit('UI:WIZARD_BACK', { step: currentStep - 1, entity });
      onBack?.();
    }
  };

  const handleNext = () => {
    if (isLastStep || isComplete) {
      eventBus.emit('UI:WIZARD_COMPLETE', { step: currentStep, entity });
      onComplete?.();
    } else {
      eventBus.emit('UI:WIZARD_NEXT', { step: currentStep + 1, entity });
      onNext?.();
    }
  };

  const handleCustomAction = (action: WizardNavigationAction) => {
    if (action.event) {
      eventBus.emit(`UI:${action.event}`, { step: currentStep, entity });
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

  const visibleCustomActions = customActions?.filter((action) => !action.hidden) || [];

  return (
    <HStack spacing={12} justify="space-between" style={[styles.container, style as ViewStyle]}>
      <HStack spacing={8}>
        {(isFirstStep && showCancel) || !isFirstStep ? (
          <Button
            variant="ghost"
            onPress={handleBack}
            disabled={isFirstStep && !showCancel ? true : !canGoBack}
            action={isFirstStep ? 'WIZARD_CANCEL' : 'WIZARD_BACK'}
          >
            {isFirstStep ? cancelLabel : backLabel}
          </Button>
        ) : null}

        {visibleCustomActions.map((action, index) => (
          <Button
            key={`${action.label}-${index}`}
            variant={action.variant || 'default'}
            onPress={() => handleCustomAction(action)}
            disabled={action.disabled}
            action={action.event}
          >
            {action.label}
          </Button>
        ))}
      </HStack>

      <Button
        variant="primary"
        onPress={handleNext}
        disabled={!canGoNext}
        action={isLastStep || isComplete ? 'WIZARD_COMPLETE' : 'WIZARD_NEXT'}
      >
        {isLastStep || isComplete ? completeLabel : nextLabel}
      </Button>
    </HStack>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
});

WizardNavigation.displayName = 'WizardNavigation';
