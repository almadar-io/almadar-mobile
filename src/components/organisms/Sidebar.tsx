import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { VStack } from '../atoms/Stack';

import { Typography } from '../atoms/Typography';
import { Divider } from '../atoms/Divider';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';



export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  event?: string;
  payload?: Record<string, unknown>;
  active?: boolean;
  badge?: string | number;
  disabled?: boolean;
  children?: SidebarItem[];
}

export interface SidebarProps {
  /** Sidebar sections containing navigation items */
  sections: SidebarSection[];
  /** Currently active item ID */
  activeItemId?: string;
  /** Callback when an item is pressed */
  onItemPress?: (item: SidebarItem) => void;
  /** Sidebar header content */
  header?: React.ReactNode;
  /** Sidebar footer content */
  footer?: React.ReactNode;
  /** Whether sidebar is collapsible to icon-only mode */
  collapsible?: boolean;
  /** Collapsed state (controlled) */
  collapsed?: boolean;
  /** Default collapsed state (uncontrolled) */
  defaultCollapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Sidebar width when expanded */
  expandedWidth?: number;
  /** Sidebar width when collapsed */
  collapsedWidth?: number;
  /** Container style */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  activeItemId,
  onItemPress,
  header,
  footer,
  collapsible = false,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  expandedWidth = 260,
  collapsedWidth = 72,
  style,
  isLoading,
  error,
  entity,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    sections.forEach((section) => {
      if (section.defaultCollapsed && section.collapsible !== false) {
        initial.add(section.id);
      }
    });
    return initial;
  });

  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleCollapsed = useCallback(() => {
    const newCollapsed = !isCollapsed;
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(newCollapsed);
    }
    onCollapsedChange?.(newCollapsed);
  }, [isCollapsed, controlledCollapsed, onCollapsedChange]);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const handleItemPress = useCallback(
    (item: SidebarItem) => {
      if (item.disabled) return;

      if (item.event) {
        eventBus.emit(`UI:${item.event}`, { ...item.payload, entity });
      }
      onItemPress?.(item);
    },
    [onItemPress, entity, eventBus]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { width: expandedWidth }, style]}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { width: expandedWidth }, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  const currentWidth = isCollapsed ? collapsedWidth : expandedWidth;

  const renderItem = (item: SidebarItem, level: number = 0) => {
    const isActive = activeItemId === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const paddingLeft = isCollapsed ? 0 : 12 + level * 16;

    return (
      <View key={item.id}>
        <TouchableOpacity
          onPress={() => handleItemPress(item)}
          disabled={item.disabled}
          style={[
            styles.item,
            { paddingLeft },
            isCollapsed && styles.itemCollapsed,
            isActive && [
              styles.itemActive,
              { backgroundColor: theme.colors.primary + '15' },
            ],
            item.disabled && styles.itemDisabled,
          ]}
        >
          {item.icon && (
            <View style={[styles.itemIcon, isCollapsed && styles.itemIconCollapsed]}>
              {item.icon}
            </View>
          )}
          {!isCollapsed && (
            <>
              <Typography
                variant="body"
                style={[
                  styles.itemLabel,
                  isActive ? { color: theme.colors.primary, fontWeight: '600' } : undefined,
                  item.disabled ? { color: theme.colors['muted-foreground'] } : undefined,
                ]}
              >
                {item.label}
              </Typography>
              {item.badge !== undefined && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Typography variant="caption" style={{ color: theme.colors['primary-foreground'] }}>
                    {String(item.badge)}
                  </Typography>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>
        {!isCollapsed && hasChildren && (
          <VStack style={styles.children}>
            {item.children?.map((child) => renderItem(child, level + 1))}
          </VStack>
        )}
      </View>
    );
  };

  const renderSection = (section: SidebarSection) => {
    const isSectionCollapsed = collapsedSections.has(section.id);
    const canCollapse = section.collapsible !== false;

    return (
      <View key={section.id} style={styles.section}>
        {!isCollapsed && (
          <TouchableOpacity
            onPress={() => canCollapse && toggleSection(section.id)}
            style={[styles.sectionHeader, !canCollapse && styles.sectionHeaderNonCollapsible]}
            disabled={!canCollapse}
          >
            <Typography variant="label" style={styles.sectionTitle}>
              {section.title}
            </Typography>
            {canCollapse && (
              <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                {isSectionCollapsed ? '▶' : '▼'}
              </Typography>
            )}
          </TouchableOpacity>
        )}
        {(!isSectionCollapsed || isCollapsed) && (
          <VStack spacing={2}>
            {section.items.map((item) => renderItem(item))}
          </VStack>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { width: currentWidth, backgroundColor: theme.colors.card },
        style,
      ]}
    >
      {/* Header */}
      {header && (
        <View style={[styles.header, isCollapsed && styles.headerCollapsed]}>{header}</View>
      )}

      {/* Collapse toggle */}
      {collapsible && (
        <>
          <TouchableOpacity
            onPress={toggleCollapsed}
            style={[styles.collapseButton, isCollapsed && styles.collapseButtonCollapsed]}
          >
            <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
              {isCollapsed ? '→' : '←'}
            </Typography>
          </TouchableOpacity>
          <Divider />
        </>
      )}

      {/* Navigation */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <VStack spacing={16} style={styles.content}>
          {sections.map(renderSection)}
        </VStack>
      </ScrollView>

      {/* Footer */}
      {footer && (
        <>
          <Divider />
          <View style={[styles.footer, isCollapsed && styles.footerCollapsed]}>{footer}</View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    padding: 16,
  },
  headerCollapsed: {
    padding: 12,
    alignItems: 'center',
  },
  collapseButton: {
    padding: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  collapseButtonCollapsed: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 12,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionHeaderNonCollapsible: {
    paddingRight: 12,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 12,
    borderRadius: 8,
  },
  itemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  itemActive: {
    borderRadius: 8,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemIconCollapsed: {
    marginRight: 0,
  },
  itemLabel: {
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  children: {
    marginLeft: 12,
  },
  footer: {
    padding: 16,
  },
  footerCollapsed: {
    padding: 12,
    alignItems: 'center',
  },
});

Sidebar.displayName = 'Sidebar';
