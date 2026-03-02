import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { HStack, VStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { CodeBlock } from '../molecules/CodeBlock';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  path?: string;
}

export interface CodeViewerProps {
  /** Files to display */
  files: CodeFile[];
  /** Currently selected file ID */
  selectedFileId?: string;
  /** Callback when file is selected */
  onFileSelect?: (fileId: string) => void;
  /** Style override */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative select event - emits UI:FILE_SELECT via eventBus */
  selectEvent?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  files,
  selectedFileId,
  onFileSelect,
  style,
  isLoading,
  error,
  selectEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleFileSelect = (fileId: string) => {
    if (selectEvent) {
      eventBus.emit(`UI:${selectEvent}`, { fileId });
    }
    onFileSelect?.(fileId);
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading code files..." />
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

  if (files.length === 0) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <EmptyState message="No code files available" />
      </Card>
    );
  }

  const selectedFile = files.find(f => f.id === selectedFileId) || files[0];

  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      typescript: '#3178c6',
      javascript: '#f7df1e',
      python: '#3776ab',
      rust: '#dea584',
      go: '#00add8',
      java: '#b07219',
      html: '#e34c26',
      css: '#563d7c',
      json: '#292929',
    };
    return colors[language.toLowerCase()] || theme.colors.primary;
  };

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]} padding="none">
      <VStack spacing={0}>
        {/* File tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack spacing={8} style={[styles.tabs, { backgroundColor: theme.colors.muted }]}>
            {files.map(file => (
              <Button
                key={file.id}
                variant={selectedFile.id === file.id ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => handleFileSelect(file.id)}
              >
                <HStack spacing={4} align="center">
                  <View
                    style={[
                      styles.languageDot,
                      { backgroundColor: getLanguageColor(file.language) },
                    ]}
                  />
                  <Typography variant="caption">{file.name}</Typography>
                </HStack>
              </Button>
            ))}
          </HStack>
        </ScrollView>

        {/* File info */}
        <HStack
          spacing={8}
          align="center"
          style={[styles.fileInfo, { borderBottomColor: theme.colors.border }]}
        >
          <Typography variant="h4" style={{ flex: 1 }}>
            {selectedFile.name}
          </Typography>
          <Badge variant="secondary">{selectedFile.language}</Badge>
          {selectedFile.path && (
            <Typography variant="caption" color={theme.colors['muted-foreground']}>
              {selectedFile.path}
            </Typography>
          )}
        </HStack>

        {/* Code content */}
        <CodeBlock
          code={selectedFile.content}
          language={selectedFile.language}
          showLineNumbers
          showCopyButton
          scrollable
        />
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  tabs: {
    padding: 12,
  },
  fileInfo: {
    padding: 16,
    borderBottomWidth: 1,
  },
  languageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

CodeViewer.displayName = 'CodeViewer';
