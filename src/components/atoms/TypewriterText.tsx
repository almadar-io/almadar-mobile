import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { HStack } from './Stack';

export interface TypewriterTextProps {
  text: string;
  speed?: number;
  startDelay?: number;
  onComplete?: () => void;
  showCursor?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  startDelay = 0,
  onComplete,
  showCursor = true,
  style,
  textStyle,
}) => {
  const theme = useTheme();
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let charIndex = 0;

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);
    }, startDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, startDelay, onComplete]);

  useEffect(() => {
    if (showCursor && !isComplete) {
      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blink.start();
      return () => blink.stop();
    }
  }, [showCursor, isComplete, cursorOpacity]);

  return (
    <HStack spacing={0} align="flex-end" style={style}>
      <Animated.Text
        style={[
          styles.text,
          {
            color: theme.colors.foreground,
            fontSize: theme.typography.sizes.base,
          },
          textStyle,
        ]}
      >
        {displayedText}
      </Animated.Text>
      {showCursor && !isComplete && (
        <Animated.Text
          style={[
            styles.cursor,
            {
              color: theme.colors.primary,
              fontSize: theme.typography.sizes.base,
              opacity: cursorOpacity,
            },
          ]}
        >
          |
        </Animated.Text>
      )}
    </HStack>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: '400',
  },
  cursor: {
    fontWeight: '300',
    marginLeft: 1,
  },
});

TypewriterText.displayName = 'TypewriterText';
