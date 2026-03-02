import React from 'react';
import { 
  View, 
  ScrollView,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Typography } from '../atoms/Typography';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';
import { HStack } from '../atoms/Stack';

export interface DataColumn {
  key: string;
  header: string;
  width?: number;
  flex?: number;
}

export interface DataRow {
  [key: string]: React.ReactNode;
}

export interface DataTableProps {
  columns: DataColumn[];
  entity: DataRow[];
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  entity,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();

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

  if (entity.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <EmptyState message="No data available" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={[styles.headerRow, { backgroundColor: theme.colors.muted }]}>
        {columns.map((col) => (
          <View 
            key={col.key} 
            style={[
              styles.cell, 
              { 
                width: col.width, 
                flex: col.flex,
                minWidth: col.width,
              }
            ]}
          >
            <Typography variant="label" style={{ color: theme.colors.foreground }}>
              {col.header}
            </Typography>
          </View>
        ))}
      </View>

      {/* Rows */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {entity.map((row, rowIndex) => (
            <HStack 
              key={rowIndex} 
              style={[
                styles.dataRow,
                { 
                  backgroundColor: rowIndex % 2 === 0 ? theme.colors.card : theme.colors.background,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              {columns.map((col) => (
                <View 
                  key={col.key} 
                  style={[
                    styles.cell, 
                    { 
                      width: col.width, 
                      flex: col.flex,
                      minWidth: col.width || 100,
                    }
                  ]}
                >
                  {typeof row[col.key] === 'string' ? (
                    <Typography variant="body" style={{ color: theme.colors.foreground }}>
                      {row[col.key]}
                    </Typography>
                  ) : (
                    row[col.key]
                  )}
                </View>
              ))}
            </HStack>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  cell: {
    paddingRight: 16,
  },
});

DataTable.displayName = 'DataTable';
