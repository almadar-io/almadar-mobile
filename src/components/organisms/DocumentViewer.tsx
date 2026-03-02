import React from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { HStack, VStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export type DocumentType = 'pdf' | 'image' | 'text' | 'markdown';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  content?: string;
  size?: string;
  pages?: number;
}

export interface DocumentViewerProps {
  /** Documents to display */
  documents: Document[];
  /** Currently selected document ID */
  selectedDocumentId?: string;
  /** Callback when document is selected */
  onDocumentSelect?: (documentId: string) => void;
  /** Style override */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative select event - emits UI:DOCUMENT_SELECT via eventBus */
  selectEvent?: string;
  /** Declarative download event - emits UI:DOCUMENT_DOWNLOAD via eventBus */
  downloadEvent?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  selectedDocumentId,
  onDocumentSelect,
  style,
  isLoading,
  error,
  selectEvent,
  downloadEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleDocumentSelect = (documentId: string) => {
    if (selectEvent) {
      eventBus.emit(`UI:${selectEvent}`, { documentId });
    }
    onDocumentSelect?.(documentId);
  };

  const handleDownload = (document: Document) => {
    if (downloadEvent) {
      eventBus.emit(`UI:${downloadEvent}`, { document });
    }
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading documents..." />
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

  if (documents.length === 0) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <EmptyState message="No documents available" />
      </Card>
    );
  }

  const selectedDocument =
    documents.find(d => d.id === selectedDocumentId) || documents[0];

  const getDocumentIcon = (type: DocumentType): string => {
    const icons: Record<DocumentType, string> = {
      pdf: '📄',
      image: '🖼️',
      text: '📝',
      markdown: '📑',
    };
    return icons[type];
  };

  const renderDocumentContent = (document: Document) => {
    switch (document.type) {
      case 'image':
        return (
          <Image
            source={{ uri: document.url }}
            style={styles.image}
            resizeMode="contain"
          />
        );
      case 'text':
      case 'markdown':
        return (
          <ScrollView style={styles.textContainer}>
            <Typography variant="body" style={styles.textContent}>
              {document.content || 'No content available'}
            </Typography>
          </ScrollView>
        );
      case 'pdf':
      default:
        return (
          <VStack align="center" spacing={16} style={styles.pdfPlaceholder}>
            <Typography variant="h1">{getDocumentIcon(document.type)}</Typography>
            <Typography variant="body" color={theme.colors['muted-foreground']}>
              PDF viewer not available in mobile preview
            </Typography>
            <Typography variant="caption" color={theme.colors['muted-foreground']}>
              {document.pages ? `${document.pages} pages` : 'PDF Document'}
            </Typography>
          </VStack>
        );
    }
  };

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]} padding="none">
      <VStack spacing={0}>
        {/* Document tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack spacing={8} style={[styles.tabs, { backgroundColor: theme.colors.muted }]}>
            {documents.map(doc => (
              <Button
                key={doc.id}
                variant={selectedDocument.id === doc.id ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => handleDocumentSelect(doc.id)}
              >
                <HStack spacing={4} align="center">
                  <Typography variant="body">{getDocumentIcon(doc.type)}</Typography>
                  <Typography variant="caption">{doc.name}</Typography>
                </HStack>
              </Button>
            ))}
          </HStack>
        </ScrollView>

        {/* Document info */}
        <HStack
          spacing={8}
          align="center"
          style={[styles.docInfo, { borderBottomColor: theme.colors.border }]}
        >
          <Typography variant="h4" style={{ flex: 1 }}>
            {getDocumentIcon(selectedDocument.type)} {selectedDocument.name}
          </Typography>
          <Badge variant="secondary">{selectedDocument.type.toUpperCase()}</Badge>
          {selectedDocument.size && (
            <Typography variant="caption" color={theme.colors['muted-foreground']}>
              {selectedDocument.size}
            </Typography>
          )}
          <Button variant="ghost" size="sm" onPress={() => handleDownload(selectedDocument)}>
            Download
          </Button>
        </HStack>

        {/* Document content */}
        <View style={styles.content}>{renderDocumentContent(selectedDocument)}</View>
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
  docInfo: {
    padding: 16,
    borderBottomWidth: 1,
  },
  content: {
    minHeight: 300,
  },
  image: {
    width: screenWidth - 32,
    height: 300,
    backgroundColor: '#000',
  },
  textContainer: {
    padding: 16,
    maxHeight: 400,
  },
  textContent: {
    lineHeight: 24,
  },
  pdfPlaceholder: {
    padding: 48,
    minHeight: 300,
    justifyContent: 'center',
  },
});

DocumentViewer.displayName = 'DocumentViewer';
