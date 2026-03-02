import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export type ChartType = 'bar' | 'line';

export interface ChartProps {
  entity: ChartDataPoint[];
  type?: ChartType;
  title?: string;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Maximum value for Y-axis scaling (auto-calculated if not provided) */
  maxValue?: number;
  /** Height of the chart */
  height?: number;
  /** Show value labels on bars */
  showValues?: boolean;
}

export const Chart: React.FC<ChartProps> = ({
  entity,
  type = 'bar',
  title,
  style,
  isLoading,
  error,
  maxValue: propMaxValue,
  height = 200,
  showValues = true,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading chart..." />
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
        <EmptyState message="No chart data available" />
      </View>
    );
  }

  const maxValue = propMaxValue ?? Math.max(...entity.map((d) => d.value), 1);

  const renderBarChart = (): React.ReactNode => {
    return (
      <HStack spacing={8} align="flex-end" style={[styles.chartContainer, { height }]}>
        {entity.map((item, index) => {
          const barHeight = (item.value / maxValue) * height * 0.8;
          const barColor = item.color || theme.colors.primary;

          return (
            <VStack
              key={index}
              align="center"
              spacing={4}
              style={styles.barWrapper}
            >
              {showValues && (
                <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                  {item.value}
                </Typography>
              )}
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: barColor,
                    borderRadius: theme.borderRadius.sm,
                  },
                ]}
              />
              <Typography
                variant="caption"
                style={{ color: theme.colors.foreground, textAlign: 'center' }}
              >
                {item.label}
              </Typography>
            </VStack>
          );
        })}
      </HStack>
    );
  };

  const renderLineChart = (): React.ReactNode => {
    const points = entity.map((item, index) => {
      const x = (index / (entity.length - 1 || 1)) * 100;
      const y = 100 - (item.value / maxValue) * 80;
      return { x, y, label: item.label, value: item.value };
    });

    // SVG path for line chart (for future SVG implementation)
    void points;
    // const pathD = points
    //   .map((point, index) => {
    //     return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    //   })
    //   .join(' ');

    return (
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.lineChartContainer}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <View
              key={percent}
              style={[
                styles.gridLine,
                {
                  bottom: `${percent}%`,
                  backgroundColor: theme.colors.border,
                },
              ]}
            />
          ))}

          {/* Line */}
          <View style={styles.linePathContainer}>
            {points.map((point, index) => {
              if (index === points.length - 1) return null;
              const nextPoint = points[index + 1];
              const x1 = (point.x / 100) * styles.linePathContainer.width;
              const y1 = (point.y / 100) * height;
              const x2 = (nextPoint.x / 100) * styles.linePathContainer.width;
              const y2 = (nextPoint.y / 100) * height;

              return (
                <View
                  key={index}
                  style={[
                    styles.lineSegment,
                    {
                      left: `${point.x}%`,
                      bottom: `${point.y}%`,
                      width: Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
                      transform: [
                        {
                          rotate: `${Math.atan2(y1 - y2, x2 - x1)}rad`,
                        },
                      ],
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Data points */}
          {points.map((point, index) => (
            <View
              key={index}
              style={[
                styles.dataPoint,
                {
                  left: `${point.x}%`,
                  bottom: `${point.y}%`,
                  backgroundColor: entity[index]?.color || theme.colors.primary,
                  borderColor: theme.colors.card,
                },
              ]}
            />
          ))}
        </View>

        {/* X-axis labels */}
        <HStack justify="space-between" style={styles.xAxisLabels}>
          {entity.map((item, index) => (
            <Typography
              key={index}
              variant="caption"
              style={{ color: theme.colors['muted-foreground'], fontSize: 10 }}
            >
              {item.label}
            </Typography>
          ))}
        </HStack>
      </View>
    );
  };

  return (
    <VStack spacing={12} style={[styles.container, style ?? {}]}>
      {title && (
        <Typography variant="h4" style={{ color: theme.colors.foreground }}>
          {title}
        </Typography>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        {type === 'bar' ? renderBarChart() : renderLineChart()}
      </ScrollView>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
  },
  chartContainer: {
    minWidth: 300,
  },
  barWrapper: {
    flex: 1,
    minWidth: 40,
  },
  bar: {
    width: '60%',
    minHeight: 4,
  },
  lineChartContainer: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.3,
  },
  linePathContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginLeft: -5,
    marginBottom: -5,
  },
  xAxisLabels: {
    marginTop: 8,
  },
});

Chart.displayName = 'Chart';
