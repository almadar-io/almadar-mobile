import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../../providers/ThemeContext';
import { Card } from '../../../atoms/Card';
import { Badge } from '../../../atoms/Badge';
import { Typography } from '../../../atoms/Typography';
import { HStack } from '../../../atoms/Stack';
import { LoadingState } from '../../../molecules/LoadingState';
import { ErrorState } from '../../../molecules/ErrorState';

export type GraphType = 'position' | 'velocity' | 'acceleration' | 'energy';

export interface DataPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface GraphSeries {
  id: string;
  label: string;
  color: string;
  data: DataPoint[];
}

export interface SimulationGraphProps {
  series: GraphSeries[];
  type?: GraphType;
  width?: number;
  height?: number;
  maxPoints?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  yMin?: number;
  yMax?: number;
  autoScale?: boolean;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

const typeLabels: Record<GraphType, string> = {
  position: 'Position',
  velocity: 'Velocity',
  acceleration: 'Acceleration',
  energy: 'Energy',
};

const typeUnits: Record<GraphType, string> = {
  position: 'px',
  velocity: 'px/s',
  acceleration: 'px/s²',
  energy: 'J',
};

export const SimulationGraph: React.FC<SimulationGraphProps> = ({
  series,
  type = 'position',
  width = 350,
  height = 200,
  maxPoints = 100,
  showLegend = true,
  showGrid = true,
  yMin,
  yMax,
  autoScale = true,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  const { minY, maxY, range } = useMemo(() => {
    if (!autoScale && yMin !== undefined && yMax !== undefined) {
      return { minY: yMin, maxY: yMax, range: yMax - yMin };
    }

    let min = Infinity;
    let max = -Infinity;

    series.forEach((s) => {
      s.data.forEach((point) => {
        min = Math.min(min, point.y);
        max = Math.max(max, point.y);
      });
    });

    if (min === Infinity) {
      min = 0;
      max = 100;
    }

    const padding = (max - min) * 0.1;
    return {
      minY: min - padding,
      maxY: max + padding,
      range: max - min + padding * 2,
    };
  }, [series, yMin, yMax, autoScale]);

  const renderGrid = () => {
    if (!showGrid) return null;

    const lines = [];
    const gridCount = 5;

    for (let i = 0; i <= gridCount; i++) {
      const y = (i / gridCount) * height;
      const value = maxY - (i / gridCount) * range;

      lines.push(
        <View key={`h-${i}`}>
          <View
            style={[
              styles.gridLine,
              {
                top: y,
                width,
                backgroundColor: theme.colors.border,
                opacity: 0.3,
              },
            ]}
          />
          <Typography
            variant="caption"
            style={[
              styles.gridLabel,
              { top: y - 8, color: theme.colors['muted-foreground'] },
            ]}
          >
            {value.toFixed(1)}
          </Typography>
        </View>
      );
    }

    return lines;
  };

  const renderSeries = () => {
    return series.map((s) => {
      const limitedData = s.data.slice(-maxPoints);
      if (limitedData.length < 2) return null;

      const xStep = width / (maxPoints - 1);

      return (
        <View key={s.id} style={styles.seriesContainer}>
          <View style={[styles.area, { width, height }]}>
            <View
              style={[
                styles.areaFill,
                {
                  backgroundColor: s.color + '20',
                  width,
                  height,
                },
              ]}
            />
          </View>
          <View style={[styles.lineContainer, { width, height }]}>
            {limitedData.map((point, index) => {
              if (index === 0) return null;

              const x1 = (index - 1) * xStep;
              const y1 = height - ((limitedData[index - 1].y - minY) / range) * height;
              const x2 = index * xStep;
              const y2 = height - ((point.y - minY) / range) * height;

              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

              return (
                <View
                  key={`${s.id}-line-${index}`}
                  style={[
                    styles.line,
                    {
                      backgroundColor: s.color,
                      width: length,
                      height: 2,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}
          </View>
          {limitedData.map((point, index) => {
            const x = index * xStep;
            const y = height - ((point.y - minY) / range) * height;

            return (
              <View
                key={`${s.id}-point-${index}`}
                style={[
                  styles.point,
                  {
                    backgroundColor: s.color,
                    left: x - 3,
                    top: y - 3,
                  },
                ]}
              />
            );
          })}
        </View>
      );
    });
  };

  const renderLegend = () => {
    if (!showLegend || series.length === 0) return null;

    return (
      <View style={styles.legend}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack spacing={12}>
            {series.map((s) => {
              const latestValue = s.data[s.data.length - 1]?.y;
              return (
                <HStack key={s.id} spacing={6} align="center">
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: s.color },
                    ]}
                  />
                  <Typography variant="caption" style={{ fontWeight: '600' }}>
                    {s.label}
                  </Typography>
                  {latestValue !== undefined && (
                    <Badge variant="default" size="sm">
                      {latestValue.toFixed(2)} {typeUnits[type]}
                    </Badge>
                  )}
                </HStack>
              );
            })}
          </HStack>
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading graph..." />
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

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <View style={styles.header}>
        <HStack justify="space-between" align="center">
          <Typography variant="h4">{typeLabels[type]}</Typography>
          <Typography variant="caption" style={{ opacity: 0.6 }}>
            {typeUnits[type]}
          </Typography>
        </HStack>
      </View>

      <View style={[styles.graphContainer, { width, height }]}>
        {renderGrid()}
        {renderSeries()}
      </View>

      {renderLegend()}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  graphContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    height: 1,
  },
  gridLabel: {
    position: 'absolute',
    left: 4,
    fontSize: 10,
  },
  seriesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  area: {
    position: 'absolute',
  },
  areaFill: {
    opacity: 0.2,
  },
  lineContainer: {
    position: 'absolute',
  },
  line: {
    position: 'absolute',
    transformOrigin: 'left center',
  },
  point: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legend: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});

SimulationGraph.displayName = 'SimulationGraph';
