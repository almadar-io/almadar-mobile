import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Card } from '../atoms/Card';
import { HStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface CodeBlockProps {
  /** Code content to display */
  code: string;
  /** Programming language for syntax highlighting hint */
  language?: string;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether to show copy button */
  showCopyButton?: boolean;
  /** Whether to allow horizontal scrolling */
  scrollable?: boolean;
  /** Style override */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative copy event name - emits UI:${copyEvent} via eventBus */
  copyEvent?: string;
}

// Simple syntax highlighting tokens
interface Token {
  text: string;
  style: 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'default';
}

const KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'import', 'export', 'from', 'class', 'interface', 'type', 'async', 'await',
  'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined',
];

const TOKEN_COLORS: Record<Token['style'], string> = {
  keyword: '#c678dd',
  string: '#98c379',
  comment: '#5c6370',
  number: '#d19a66',
  function: '#61afef',
  default: '#abb2bf',
};

/**
 * Simple tokenizer for basic syntax highlighting
 */
const tokenizeCode = (code: string): Token[][] => {
  const lines = code.split('\n');

  return lines.map((line) => {
    const tokens: Token[] = [];
    let remaining = line;

    while (remaining.length > 0) {
      let matched = false;

      // Check for comments
      if (remaining.startsWith('//')) {
        tokens.push({ text: remaining, style: 'comment' });
        break;
      }

      // Check for strings (double quotes)
      if (remaining.startsWith('"')) {
        const endIndex = remaining.indexOf('"', 1);
        if (endIndex > 0) {
          tokens.push({ text: remaining.slice(0, endIndex + 1), style: 'string' });
          remaining = remaining.slice(endIndex + 1);
          matched = true;
          continue;
        }
      }

      // Check for strings (single quotes)
      if (remaining.startsWith("'")) {
        const endIndex = remaining.indexOf("'", 1);
        if (endIndex > 0) {
          tokens.push({ text: remaining.slice(0, endIndex + 1), style: 'string' });
          remaining = remaining.slice(endIndex + 1);
          matched = true;
          continue;
        }
      }

      // Check for strings (template literals)
      if (remaining.startsWith('`')) {
        const endIndex = remaining.indexOf('`', 1);
        if (endIndex > 0) {
          tokens.push({ text: remaining.slice(0, endIndex + 1), style: 'string' });
          remaining = remaining.slice(endIndex + 1);
          matched = true;
          continue;
        }
      }

      // Check for numbers
      const numberMatch = remaining.match(/^\d+(\.\d+)?/);
      if (numberMatch) {
        tokens.push({ text: numberMatch[0], style: 'number' });
        remaining = remaining.slice(numberMatch[0].length);
        matched = true;
        continue;
      }

      // Check for keywords and identifiers
      const wordMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (wordMatch) {
        const word = wordMatch[0];
        const style: Token['style'] = KEYWORDS.includes(word) ? 'keyword' : 'default';
        tokens.push({ text: word, style });
        remaining = remaining.slice(word.length);
        matched = true;
        continue;
      }

      // Check for function calls (identifier followed by opening paren)
      const funcMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
      if (funcMatch && !KEYWORDS.includes(funcMatch[1])) {
        tokens.pop(); // Remove the identifier we just added
        tokens.push({ text: funcMatch[1], style: 'function' });
        tokens.push({ text: '(', style: 'default' });
        remaining = remaining.slice(funcMatch[0].length - 1);
        matched = true;
        continue;
      }

      // If nothing matched, take the first character as default
      if (!matched) {
        tokens.push({ text: remaining[0], style: 'default' });
        remaining = remaining.slice(1);
      }
    }

    return tokens;
  });
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  showLineNumbers = true,
  showCopyButton = true,
  scrollable = true,
  style,
  isLoading,
  error,
  copyEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleCopy = () => {
    if (copyEvent) {
      eventBus.emit(`UI:${copyEvent}`, { code, language });
    }
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, style || {}]}>
        <LoadingState message="Loading code..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.container, style || {}]}>
        <ErrorState message={error.message} />
      </Card>
    );
  }

  const tokenizedLines = tokenizeCode(code);
  const lineNumberWidth = String(tokenizedLines.length).length * 10 + 16;

  const CodeContent = (
    <View style={styles.codeContainer}>
      {tokenizedLines.map((tokens, lineIndex) => (
        <View key={lineIndex} style={styles.line}>
          {showLineNumbers && (
            <View style={[styles.lineNumber, { width: lineNumberWidth }]}>
              <Typography
                variant="caption"
                style={{ color: theme.colors['muted-foreground'] }}
              >
                {lineIndex + 1}
              </Typography>
            </View>
          )}
          <View style={styles.lineContent}>
            {tokens.length === 0 ? (
              <Typography variant="body"> </Typography>
            ) : (
              <Typography variant="body">
                {tokens.map((token, tokenIndex) => (
                  <Typography
                    key={tokenIndex}
                    variant="body"
                    style={{
                      color: TOKEN_COLORS[token.style],
                      fontFamily: 'monospace',
                    }}
                  >
                    {token.text}
                  </Typography>
                ))}
              </Typography>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <Card style={[styles.container, style || {}]} padding="none">
      {(language || showCopyButton) && (
        <HStack
          spacing={8}
          align="center"
          justify="space-between"
          style={[
            styles.header,
            { backgroundColor: theme.colors.muted, borderBottomColor: theme.colors.border },
          ]}
        >
          {language ? (
            <Typography
              variant="caption"
              style={{
                color: theme.colors['muted-foreground'],
                textTransform: 'uppercase',
              }}
            >
              {language}
            </Typography>
          ) : (
            <View />
          )}
          {showCopyButton && (
            <Button variant="ghost" size="sm" onPress={handleCopy}>
              Copy
            </Button>
          )}
        </HStack>
      )}

      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          {CodeContent}
        </ScrollView>
      ) : (
        CodeContent
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  codeContainer: {
    padding: 16,
  },
  line: {
    flexDirection: 'row',
  },
  lineNumber: {
    alignItems: 'flex-end',
    paddingRight: 16,
    opacity: 0.5,
  },
  lineContent: {
    flex: 1,
  },
});

CodeBlock.displayName = 'CodeBlock';
