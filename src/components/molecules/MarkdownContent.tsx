import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Card } from '../atoms/Card';
import { VStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface MarkdownContentProps {
  /** Markdown content to render */
  content: string;
  /** Style override */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Base padding for content */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Markdown element types
type MarkdownElement =
  | { type: 'heading'; level: number; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'code'; language: string; content: string }
  | { type: 'inlineCode'; content: string }
  | { type: 'blockquote'; content: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'horizontalRule' }
  | { type: 'strong'; content: string }
  | { type: 'emphasis'; content: string }
  | { type: 'link'; text: string; url: string }
  | { type: 'image'; alt: string; url: string }
  | { type: 'lineBreak' };

/**
 * Simple markdown parser - converts markdown text to structured elements
 */
const parseMarkdown = (content: string): MarkdownElement[] => {
  const elements: MarkdownElement[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Empty line
    if (trimmedLine === '') {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(---|___|\*\*\*)$/.test(trimmedLine)) {
      elements.push({ type: 'horizontalRule' });
      i++;
      continue;
    }

    // Heading
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      elements.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: parseInlineElements(headingMatch[2]),
      });
      i++;
      continue;
    }

    // Code block
    const codeBlockStart = trimmedLine.match(/^```(\w*)/);
    if (codeBlockStart) {
      const language = codeBlockStart[1] || '';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().match(/^```$/)) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push({
        type: 'code',
        language,
        content: codeLines.join('\n'),
      });
      i++; // Skip closing ```
      continue;
    }

    // Blockquote
    if (trimmedLine.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().substring(1).trim());
        i++;
      }
      elements.push({
        type: 'blockquote',
        content: parseInlineElements(quoteLines.join(' ')),
      });
      continue;
    }

    // Ordered list
    const orderedListMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (orderedListMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        const itemMatch = currentLine.match(/^\d+\.\s+(.+)$/);
        if (itemMatch) {
          items.push(parseInlineElements(itemMatch[1]));
          i++;
        } else if (currentLine === '') {
          i++;
          break;
        } else {
          break;
        }
      }
      elements.push({ type: 'list', ordered: true, items });
      continue;
    }

    // Unordered list
    const unorderedListMatch = trimmedLine.match(/^[\*\-\+]\s+(.+)$/);
    if (unorderedListMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        const itemMatch = currentLine.match(/^[\*\-\+]\s+(.+)$/);
        if (itemMatch) {
          items.push(parseInlineElements(itemMatch[1]));
          i++;
        } else if (currentLine === '') {
          i++;
          break;
        } else {
          break;
        }
      }
      elements.push({ type: 'list', ordered: false, items });
      continue;
    }

    // Paragraph (collect consecutive non-empty lines)
    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '') {
      paragraphLines.push(lines[i]);
      i++;
    }
    elements.push({
      type: 'paragraph',
      content: parseInlineElements(paragraphLines.join(' ')),
    });
  }

  return elements;
};

/**
 * Parse inline markdown elements (bold, italic, code, links, etc.)
 */
const parseInlineElements = (text: string): string => {
  // Process inline code
  let result = text.replace(/`([^`]+)`/g, '『$1』');

  // Process bold
  result = result.replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, '【$1$2】');

  // Process italic
  result = result.replace(/\*([^*]+)\*|_([^_]+)_/g, '〔$1$2〕');

  // Process links [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '『$1』($2)');

  // Process images ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[Image: $1]');

  return result;
};

/**
 * Render inline content with formatting
 */
const renderInlineContent = (content: string, theme: ReturnType<typeof useTheme>): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  const patterns = [
    { regex: /『([^』]+)』/g, type: 'code' as const },
    { regex: /【([^】]+)】/g, type: 'bold' as const },
    { regex: /〔([^〕]+)〕/g, type: 'italic' as const },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { index: number; match: RegExpExecArray; type: 'code' | 'bold' | 'italic' } | null = null;

    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      const match = pattern.regex.exec(remaining);
      if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
        earliestMatch = { index: match.index, match, type: pattern.type };
      }
    }

    if (earliestMatch) {
      // Add text before the match
      if (earliestMatch.index > 0) {
        parts.push(
          <Typography key={key++} variant="body">
            {remaining.slice(0, earliestMatch.index)}
          </Typography>
        );
      }

      // Add the formatted content
      const content = earliestMatch.match[1];
      switch (earliestMatch.type) {
        case 'code':
          parts.push(
            <Typography
              key={key++}
              variant="body"
              style={{
                fontFamily: 'monospace',
                backgroundColor: theme.colors.muted,
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              {content}
            </Typography>
          );
          break;
        case 'bold':
          parts.push(
            <Typography
              key={key++}
              variant="body"
              style={{ fontWeight: '700' }}
            >
              {content}
            </Typography>
          );
          break;
        case 'italic':
          parts.push(
            <Typography
              key={key++}
              variant="body"
              style={{ fontStyle: 'italic' }}
            >
              {content}
            </Typography>
          );
          break;
      }

      remaining = remaining.slice(earliestMatch.index + earliestMatch.match[0].length);
    } else {
      // No more matches, add remaining text
      parts.push(
        <Typography key={key++} variant="body">
          {remaining}
        </Typography>
      );
      break;
    }
  }

  return parts;
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  style,
  isLoading,
  error,
  padding = 'md',
}) => {
  const theme = useTheme();
  const elements = React.useMemo(() => parseMarkdown(content), [content]);

  if (isLoading) {
    return (
      <Card style={[styles.container, style || {}]}>
        <LoadingState message="Loading content..." />
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

  const paddingStyles: Record<string, ViewStyle> = {
    none: { padding: 0 },
    sm: { padding: 12 },
    md: { padding: 16 },
    lg: { padding: 24 },
  };

  const renderElement = (element: MarkdownElement, index: number): React.ReactNode => {
    switch (element.type) {
      case 'heading':
        const variantMap: Record<number, 'h1' | 'h2' | 'h3' | 'h4' | 'body'> = {
          1: 'h1',
          2: 'h2',
          3: 'h3',
          4: 'h4',
          5: 'body',
          6: 'body',
        };
        return (
          <Typography
            key={index}
            variant={variantMap[element.level] || 'body'}
            style={[
              styles.heading,
              element.level > 2 && { color: theme.colors['muted-foreground'] },
            ]}
          >
            {element.content}
          </Typography>
        );

      case 'paragraph':
        return (
          <View key={index} style={styles.paragraph}>
            {renderInlineContent(element.content, theme)}
          </View>
        );

      case 'code':
        return (
          <View
            key={index}
            style={[
              styles.codeBlock,
              { backgroundColor: theme.colors.muted },
            ]}
          >
            {element.language && (
              <Typography
                variant="caption"
                style={{
                  color: theme.colors['muted-foreground'],
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                {element.language}
              </Typography>
            )}
            <Typography
              variant="body"
              style={{
                fontFamily: 'monospace',
                color: theme.colors.foreground,
              }}
            >
              {element.content}
            </Typography>
          </View>
        );

      case 'blockquote':
        return (
          <View
            key={index}
            style={[
              styles.blockquote,
              {
                borderLeftColor: theme.colors.primary,
                backgroundColor: theme.colors.muted,
              },
            ]}
          >
            <Typography
              variant="body"
              style={{ color: theme.colors['muted-foreground'] }}
            >
              {element.content}
            </Typography>
          </View>
        );

      case 'list':
        return (
          <View key={index} style={styles.list}>
            {element.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.listItem}>
                <Typography
                  variant="body"
                  style={[
                    styles.listMarker,
                    { color: theme.colors.primary },
                  ]}
                >
                  {element.ordered ? `${itemIndex + 1}.` : '•'}
                </Typography>
                <View style={styles.listItemContent}>
                  {renderInlineContent(item, theme)}
                </View>
              </View>
            ))}
          </View>
        );

      case 'horizontalRule':
        return (
          <View
            key={index}
            style={[
              styles.horizontalRule,
              { backgroundColor: theme.colors.border },
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card style={[styles.container, style || {}]} padding="none">
      <VStack spacing={12} style={[styles.content, paddingStyles[padding]]}>
        {elements.map((element, index) => renderElement(element, index))}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    width: '100%',
  },
  heading: {
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginVertical: 4,
  },
  codeBlock: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  blockquote: {
    padding: 12,
    paddingLeft: 16,
    borderLeftWidth: 4,
    borderRadius: 4,
    marginVertical: 8,
  },
  list: {
    marginVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  listMarker: {
    width: 24,
  },
  listItemContent: {
    flex: 1,
  },
  horizontalRule: {
    height: 1,
    marginVertical: 16,
  },
});

MarkdownContent.displayName = 'MarkdownContent';
