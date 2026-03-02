import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Card } from '../../atoms/Card';
import { Typography } from '../../atoms/Typography';
import { VStack } from '../../atoms/Stack';

export interface DialogueChoice {
  text: string;
  action?: string;
  next?: string;
  disabled?: boolean;
}

export interface DialogueNode {
  id?: string;
  speaker: string;
  text: string;
  portrait?: string;
  choices?: DialogueChoice[];
  autoAdvance?: number; // ms to auto-advance, undefined = wait for input
}

export interface DialogueBoxProps {
  /** Current dialogue node to display */
  dialogue: DialogueNode;
  /** Typewriter speed in ms per character (0 = instant) */
  typewriterSpeed?: number;
  /** Position of dialogue box */
  position?: 'top' | 'bottom';
  /** Called when text animation completes */
  onComplete?: () => void;
  /** Called when a choice is selected */
  onChoice?: (choice: DialogueChoice) => void;
  /** Called when dialogue is advanced (no choices) */
  onAdvance?: () => void;
  /** Declarative event: emits UI:{completeEvent} when text animation completes */
  completeEvent?: string;
  /** Declarative event: emits UI:{choiceEvent} with { choice } when a choice is selected */
  choiceEvent?: string;
  /** Declarative event: emits UI:{advanceEvent} when dialogue is advanced */
  advanceEvent?: string;
  /** Optional style */
  style?: ViewStyle;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  dialogue,
  typewriterSpeed = 30,
  position = 'bottom',
  onComplete,
  onChoice,
  onAdvance,
  completeEvent,
  choiceEvent,
  advanceEvent,
  style,
}) => {
  useTheme(); // Theme hook required by pattern
  const eventBus = useEventBus();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(0);
  const textRef = useRef(dialogue.text);
  const charIndexRef = useRef(0);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when dialogue changes
  useEffect(() => {
    textRef.current = dialogue.text;
    charIndexRef.current = 0;
    setDisplayedText('');
    setSelectedChoice(0);

    if (typewriterSpeed === 0) {
      // Instant display
      setDisplayedText(dialogue.text);
      setIsTyping(false);
      if (completeEvent) eventBus.emit(`UI:${completeEvent}`, {});
      onComplete?.();
    } else {
      setIsTyping(true);
    }

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [dialogue, typewriterSpeed, onComplete, completeEvent, eventBus]);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping || typewriterSpeed === 0) return;

    const interval = setInterval(() => {
      if (charIndexRef.current < textRef.current.length) {
        charIndexRef.current++;
        setDisplayedText(textRef.current.slice(0, charIndexRef.current));
      } else {
        setIsTyping(false);
        clearInterval(interval);
        if (completeEvent) eventBus.emit(`UI:${completeEvent}`, {});
        onComplete?.();

        // Auto-advance if configured
        if (dialogue.autoAdvance && !dialogue.choices?.length) {
          autoAdvanceTimerRef.current = setTimeout(() => {
            if (advanceEvent) eventBus.emit(`UI:${advanceEvent}`, {});
            onAdvance?.();
          }, dialogue.autoAdvance);
        }
      }
    }, typewriterSpeed);

    return () => clearInterval(interval);
  }, [isTyping, typewriterSpeed, dialogue.autoAdvance, dialogue.choices, onComplete, onAdvance, completeEvent, advanceEvent, eventBus]);

  // Skip to end of text
  const skipTypewriter = useCallback(() => {
    if (isTyping) {
      charIndexRef.current = textRef.current.length;
      setDisplayedText(textRef.current);
      setIsTyping(false);
      if (completeEvent) eventBus.emit(`UI:${completeEvent}`, {});
      onComplete?.();
    }
  }, [isTyping, onComplete, completeEvent, eventBus]);

  // Handle tap
  const handlePress = useCallback(() => {
    if (isTyping) {
      skipTypewriter();
    } else if (!dialogue.choices?.length) {
      if (advanceEvent) eventBus.emit(`UI:${advanceEvent}`, {});
      onAdvance?.();
    }
  }, [isTyping, skipTypewriter, dialogue.choices, onAdvance, advanceEvent, eventBus]);

  // Handle choice selection
  const handleChoice = useCallback((choice: DialogueChoice, index: number) => {
    setSelectedChoice(index);
    if (choiceEvent) eventBus.emit(`UI:${choiceEvent}`, { choice });
    onChoice?.(choice);
  }, [onChoice, choiceEvent, eventBus]);

  const enabledChoices = dialogue.choices?.filter(c => !c.disabled) ?? [];

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      style={[
        styles.container,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        ...(style ? [style] : []),
      ]}
    >
      <Card style={styles.card}>
        <View style={styles.content}>
          {/* Speaker name */}
          <Typography 
            variant="h4" 
            style={{ color: '#eab308', marginBottom: 8 }}
          >
            {dialogue.speaker}
          </Typography>

          {/* Dialogue text */}
          <View style={styles.textContainer}>
            <Typography variant="body" style={{ lineHeight: 24 }}>
              {displayedText}
              {isTyping && (
                <Text style={styles.cursor}>▌</Text>
              )}
            </Typography>
          </View>

          {/* Choices */}
          {!isTyping && enabledChoices.length > 0 && (
            <VStack spacing={8} style={styles.choices}>
              {enabledChoices.map((choice, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleChoice(choice, index)}
                  style={[
                    styles.choiceButton,
                    selectedChoice === index && styles.choiceSelected,
                  ]}
                >
                  <Text style={selectedChoice === index ? styles.choiceTextSelected : styles.choiceText}>
                    <Text style={{ color: '#6b7280', marginRight: 8 }}>{index + 1}. </Text>
                    {choice.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </VStack>
          )}

          {/* Continue indicator */}
          {!isTyping && !dialogue.choices?.length && (
            <Text style={styles.continueText}>
              Tap to continue...
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 40,
  },
  topPosition: {
    top: 0,
  },
  bottomPosition: {
    bottom: 0,
  },
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  content: {
    padding: 16,
  },
  textContainer: {
    minHeight: 60,
  },
  cursor: {
    opacity: 0.7,
  },
  choices: {
    marginTop: 16,
  },
  choiceButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1f2937',
  },
  choiceSelected: {
    backgroundColor: '#374151',
  },
  choiceText: {
    color: '#ffffff',
  },
  choiceTextSelected: {
    color: '#eab308',
  },
  continueText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
});

DialogueBox.displayName = 'DialogueBox';
