import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { Card } from '../../atoms/Card';
import { Typography } from '../../atoms/Typography';
import { VStack, HStack } from '../../atoms/Stack';

export interface TraitState {
  id: string;
  name: string;
  icon?: string;
  description: string;
  active: boolean;
  cooldown?: number;
  maxCooldown?: number;
  charges?: number;
  maxCharges?: number;
  duration?: number;
  maxDuration?: number;
  tags?: string[];
}

export interface TraitStateViewerProps {
  /** Active traits to display */
  traits: TraitState[];
  /** Whether to show inactive traits */
  showInactive?: boolean;
  /** Group by category/tag */
  groupBy?: 'none' | 'tag' | 'active';
  /** Additional styles */
  style?: ViewStyle;
}

export const TraitStateViewer: React.FC<TraitStateViewerProps> = ({
  traits,
  showInactive = true,
  groupBy = 'active',
  style,
}) => {
  const theme = useTheme();

  const filteredTraits = showInactive 
    ? traits 
    : traits.filter(t => t.active);

  const groupedTraits = React.useMemo(() => {
    if (groupBy === 'none') return { All: filteredTraits };
    
    if (groupBy === 'active') {
      return {
        Active: filteredTraits.filter(t => t.active),
        Inactive: filteredTraits.filter(t => !t.active),
      };
    }
    
    // Group by tag
    return filteredTraits.reduce((acc, trait) => {
      const tag = trait.tags?.[0] || 'Other';
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(trait);
      return acc;
    }, {} as Record<string, TraitState[]>);
  }, [filteredTraits, groupBy]);

  const renderTrait = (trait: TraitState) => {
    const cooldownPercent = trait.maxCooldown 
      ? ((trait.maxCooldown - (trait.cooldown || 0)) / trait.maxCooldown) * 100 
      : 100;
    const durationPercent = trait.maxDuration 
      ? ((trait.duration || 0) / trait.maxDuration) * 100 
      : 100;

    return (
      <View 
        key={trait.id} 
        style={[
          styles.traitCard,
          { 
            opacity: trait.active ? 1 : 0.5,
            borderColor: trait.active ? theme.colors.primary : '#374151',
          }
        ]}
      >
        <HStack spacing={12} align="center">
          <View style={[
            styles.iconContainer,
            { backgroundColor: trait.active ? 'rgba(59, 130, 246, 0.2)' : '#374151' }
          ]}>
            <Text style={styles.traitIcon}>
              {trait.icon || '✦'}
            </Text>
          </View>
          
          <VStack spacing={4} style={styles.traitInfo}>
            <HStack spacing={8} align="center">
              <Text style={styles.traitName}>{trait.name}</Text>
              {trait.charges !== undefined && trait.maxCharges && (
                <View style={styles.chargeBadge}>
                  <Text style={styles.chargeText}>
                    {trait.charges}/{trait.maxCharges}
                  </Text>
                </View>
              )}
            </HStack>
            
            <Text style={styles.traitDesc} numberOfLines={2}>
              {trait.description}
            </Text>
            
            {/* Cooldown bar */}
            {trait.cooldown !== undefined && trait.cooldown > 0 && (
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.cooldownBar, 
                    { width: `${cooldownPercent}%` }
                  ]} 
                />
                <Text style={styles.barLabel}>{trait.cooldown}s</Text>
              </View>
            )}
            
            {/* Duration bar */}
            {trait.duration !== undefined && trait.duration > 0 && (
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.durationBar, 
                    { width: `${durationPercent}%` }
                  ]} 
                />
                <Text style={styles.barLabel}>{trait.duration}s</Text>
              </View>
            )}
            
            {/* Tags */}
            {trait.tags && trait.tags.length > 0 && (
              <HStack spacing={4} style={styles.tags}>
                {trait.tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </HStack>
            )}
          </VStack>
        </HStack>
      </View>
    );
  };

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <VStack spacing={16}>
        <Typography variant="h4" style={{ color: '#fff' }}>
          Active Traits
        </Typography>
        
        {Object.entries(groupedTraits).map(([group, groupTraits]) => (
          groupTraits.length > 0 && (
            <VStack key={group} spacing={8}>
              {groupBy !== 'none' && (
                <Text style={styles.groupLabel}>{group}</Text>
              )}
              <VStack spacing={8}>
                {groupTraits.map(renderTrait)}
              </VStack>
            </VStack>
          )
        ))}
        
        {filteredTraits.length === 0 && (
          <Text style={styles.emptyText}>No active traits</Text>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  groupLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  traitCard: {
    padding: 12,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  traitIcon: {
    fontSize: 24,
  },
  traitInfo: {
    flex: 1,
  },
  traitName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chargeBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  chargeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  traitDesc: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  barContainer: {
    height: 16,
    backgroundColor: '#374151',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  cooldownBar: {
    height: '100%',
    backgroundColor: '#6b7280',
  },
  durationBar: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  barLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlign: 'center',
    color: '#fff',
    fontSize: 10,
    lineHeight: 16,
  },
  tags: {
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: '#9ca3af',
    fontSize: 10,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    padding: 24,
  },
});

TraitStateViewer.displayName = 'TraitStateViewer';
