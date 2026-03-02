import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { Card } from '../../../../atoms/Card';
import { Typography } from '../../../../atoms/Typography';
import { HStack, VStack } from '../../../../atoms/Stack';
import { Button } from '../../../../atoms/Button';
import { Badge } from '../../../../atoms/Badge';
import { CodeBlock } from '../../../../molecules/CodeBlock';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';
import { EmptyState } from '../../../../molecules/EmptyState';

export interface CodeSection {
  id: string;
  name: string;
  code: string;
  language: string;
  lineStart?: number;
  highlights?: number[];
}

export interface CodeViewProps {
  /** Code sections to display */
  sections: CodeSection[];
  /** Currently selected section ID */
  selectedSectionId?: string;
  /** Full generated code (if available) */
  fullCode?: string;
  /** Language of the code */
  language?: string;
  /** Component name */
  componentName?: string;
  /** Style override */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative section select event - emits UI:SECTION_SELECT via eventBus */
  sectionSelectEvent?: string;
  /** Declarative run event - emits UI:CODE_RUN via eventBus */
  runEvent?: string;
  /** Declarative copy event - emits UI:CODE_COPY via eventBus */
  copyEvent?: string;
  /** Declarative export event - emits UI:CODE_EXPORT via eventBus */
  exportEvent?: string;
}

export const CodeView: React.FC<CodeViewProps> = ({
  sections,
  selectedSectionId,
  fullCode,
  language = 'typescript',
  componentName,
  style,
  isLoading,
  error,
  sectionSelectEvent,
  runEvent,
  copyEvent,
  exportEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [activeTab, setActiveTab] = React.useState<'sections' | 'full'>('sections');

  const handleSectionSelect = (sectionId: string) => {
    if (sectionSelectEvent) {
      eventBus.emit(`UI:${sectionSelectEvent}`, { sectionId });
    }
  };

  const handleRun = () => {
    if (runEvent) {
      eventBus.emit(`UI:${runEvent}`, { sections, fullCode });
    }
  };

  const handleCopy = () => {
    const codeToCopy = activeTab === 'full' && fullCode ? fullCode : getAllSectionsCode();
    if (copyEvent) {
      eventBus.emit(`UI:${copyEvent}`, { code: codeToCopy, language });
    }
  };

  const handleExport = () => {
    const codeToExport = activeTab === 'full' && fullCode ? fullCode : getAllSectionsCode();
    if (exportEvent) {
      eventBus.emit(`UI:${exportEvent}`, { code: codeToExport, language, componentName });
    }
  };

  const getAllSectionsCode = (): string => {
    return sections.map(s => `// ${s.name}\n${s.code}`).join('\n\n');
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId) || sections[0];

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading code..." />
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

  if (sections.length === 0 && !fullCode) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <EmptyState message="No code available" />
      </Card>
    );
  }

  const displayCode =
    activeTab === 'full' && fullCode ? fullCode : selectedSection?.code || '';

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]} padding="none">
      <VStack spacing={0}>
        {/* Header */}
        <HStack
          justify="space-between"
          align="center"
          style={[styles.header, { backgroundColor: theme.colors.muted }]}
        >
          <HStack spacing={8} align="center">
            <Typography variant="h4">
              {componentName ? `${componentName}.tsx` : 'Code'}
            </Typography>
            <Badge variant="secondary">{language}</Badge>
          </HStack>
          <HStack spacing={8}>
            {runEvent && (
              <Button variant="primary" size="sm" onPress={handleRun}>
                ▶ Run
              </Button>
            )}
            {copyEvent && (
              <Button variant="secondary" size="sm" onPress={handleCopy}>
                📋 Copy
              </Button>
            )}
            {exportEvent && (
              <Button variant="ghost" size="sm" onPress={handleExport}>
                💾 Export
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Tabs */}
        {fullCode && (
          <HStack spacing={0} style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
            <Button
              variant={activeTab === 'sections' ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setActiveTab('sections')}
              style={styles.tabButton}
            >
              Sections
            </Button>
            <Button
              variant={activeTab === 'full' ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setActiveTab('full')}
              style={styles.tabButton}
            >
              Full Code
            </Button>
          </HStack>
        )}

        {/* Section tabs (when in sections mode) */}
        {activeTab === 'sections' && sections.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack spacing={4} style={styles.sectionTabs}>
              {sections.map(section => (
                <Button
                  key={section.id}
                  variant={selectedSection?.id === section.id ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => handleSectionSelect(section.id)}
                >
                  {section.name}
                </Button>
              ))}
            </HStack>
          </ScrollView>
        )}

        {/* Section info */}
        {activeTab === 'sections' && selectedSection && (
          <HStack
            spacing={8}
            align="center"
            style={[styles.sectionInfo, { borderBottomColor: theme.colors.border }]}
          >
            <Typography variant="body" style={{ fontWeight: '600' }}>
              {selectedSection.name}
            </Typography>
            {selectedSection.lineStart !== undefined && (
              <Typography variant="caption" color={theme.colors['muted-foreground']}>
                Line {selectedSection.lineStart}
              </Typography>
            )}
            {selectedSection.highlights && selectedSection.highlights.length > 0 && (
              <Badge variant="warning" size="sm">
                {selectedSection.highlights.length} highlights
              </Badge>
            )}
          </HStack>
        )}

        {/* Code content */}
        <CodeBlock
          code={displayCode}
          language={language}
          showLineNumbers
          showCopyButton={false}
          scrollable
        />

        {/* Stats */}
        <HStack
          spacing={16}
          style={[styles.stats, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.muted }]}
        >
          <Typography variant="caption" color={theme.colors['muted-foreground']}>
            {sections.length} section{sections.length !== 1 ? 's' : ''}
          </Typography>
          <Typography variant="caption" color={theme.colors['muted-foreground']}>
            {displayCode.split('\n').length} lines
          </Typography>
          <Typography variant="caption" color={theme.colors['muted-foreground']}>
            {displayCode.length} chars
          </Typography>
        </HStack>
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    padding: 16,
  },
  tabs: {
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    borderRadius: 0,
  },
  sectionTabs: {
    padding: 12,
  },
  sectionInfo: {
    padding: 12,
    borderBottomWidth: 1,
  },
  stats: {
    padding: 12,
    borderTopWidth: 1,
    justifyContent: 'flex-end',
  },
});

CodeView.displayName = 'CodeView';
