# @almadar/mobile

React Native UI components for the Almadar platform. This package provides mobile-optimized components that mirror the functionality of @almadar/ui while following React Native patterns and best practices.

## Features

- **154 Components** - Comprehensive component library (100% of @almadar/ui)
- **Event Bus Architecture** - Declarative event-driven interactions
- **Closed Circuit Props** - Consistent loading, error, and entity states
- **Theme System** - Full light/dark theme support with CSS variable parity
- **TypeScript** - Full type safety

## Installation

```bash
npm install @almadar/mobile
# or
yarn add @almadar/mobile
# or
pnpm add @almadar/mobile
```

## Quick Start

```tsx
import { ThemeProvider, Button, Card, VStack } from '@almadar/mobile';

function App() {
  return (
    <ThemeProvider>
      <VStack spacing={16} style={{ padding: 16 }}>
        <Card>
          <Button 
            variant="primary"
            action="SUBMIT_FORM"
            actionPayload={{ formId: 'contact' }}
          >
            Submit
          </Button>
        </Card>
      </VStack>
    </ThemeProvider>
  );
}
```

## Component Architecture

### Closed Circuit Props

All components implement the closed circuit pattern:

```tsx
interface ComponentProps {
  // Visual state
  isLoading?: boolean;  // Shows LoadingState when true
  error?: Error | null; // Shows ErrorState when present
  entity?: string;      // Entity name for auto-fetch
  
  // Styling
  style?: ViewStyle;    // React Native styles
}
```

### Event Bus Pattern

Interactive components use the event bus for loose coupling:

```tsx
<Button 
  action="SAVE_ITEM"           // Emits 'UI:SAVE_ITEM'
  actionPayload={{ id: 1 }}    // Event payload
  onPress={() => {}}           // Optional callback
>
  Save
</Button>
```

Events follow the pattern: `UI:EVENT_NAME`

## Component Categories

### Atoms (16 components)
Basic building blocks:
- **Layout**: VStack, HStack, Box, Center
- **Typography**: Typography
- **Form**: Button, Input, Label, Checkbox, Radio, Switch, Textarea, Select, Spinner, ProgressBar
- **Display**: Card, Badge, Avatar, Divider, Icon

### Molecules (18 components)
Composite components:
- **Feedback**: Alert, Toast, Skeleton, LoadingState, ErrorState, EmptyState
- **Form**: FormField, FormSectionHeader, InputGroup, SearchInput, ButtonGroup
- **Navigation**: Tabs, Breadcrumb
- **Overlay**: Modal, Drawer, Tooltip, Popover, Menu

### Organisms (28 components)
Complex components:
- **Layout**: Header, PageHeader, DashboardLayout, AuthLayout
- **Data**: DataTable, StatCard, Timeline, EntityList, EntityCard, CardGrid
- **Form**: FormSection, WizardContainer, DetailPanel
- **Game**: BattleBoard, CastleBoard, WorldMapBoard, IsometricCanvas, GameCanvas3D, CombatLog, DialogueBox, GameHud, InventoryPanel, GameMenu, GameOverScreen, GameAudioProvider, GameAudioToggle, TraitSlot, TraitStateViewer, UncontrolledBattleBoard, CanvasEffect

### Templates (2 components)
Page layouts:
- **DashboardLayout** - Main app layout with header
- **AuthLayout** - Login/register layouts with keyboard avoiding

### Hooks (9 hooks)
- **useEventBus** - Event bus integration
- **useTheme** - Theme access
- **useThemeStyles** - Theme-aware StyleSheet
- **useNavigation** - Navigation helpers
- **useScrollHeader** - Collapsible headers
- **useSafeAreaInsets** - Safe area handling
- **usePullToRefresh** - Pull-to-refresh
- **useInfiniteScroll** - Infinite scroll

## Theming

Themes match @almadar/ui CSS variables:

```tsx
const theme = {
  colors: {
    primary: '#14b8a6',
    'primary-hover': '#0d9488',
    'primary-foreground': '#ffffff',
    // ... all CSS variables mapped
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },
  shadows: {
    sm: { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation },
    main: { ... },
    lg: { ... },
  },
};
```

## Phase Implementation Summary

| Phase | Components Added | Coverage |
|-------|------------------|----------|
| Phase 1: Foundation | +10 | Atoms: 19% → 52% |
| Phase 2: Navigation | +6 | Organisms: 5% → 11% |
| Phase 3: Data Display | +10 | Molecules: 15% → 44% |
| Phase 4: Advanced UI | +9 | Molecules: 36% → 50% |
| Phase 5: Game Systems | +17 | Organisms: 11% → 28% |
| Phase 6: Layout & Containers | +7 | Atoms/Molecules: expansion |
| Phase 7: UI Enhancement | +8 | Molecules: expansion |
| Phase 8: Data Display | +10 | Organisms: expansion |
| Phase 9: Form & Input | +6 | Molecules/Organisms: expansion |
| Phase 10: Layout Structure | +8 | Organisms: expansion |
| Phase 11: Slots & Layouts | +5 | Organisms: expansion |
| Phase 12: Book Components | +5 | Organisms: book/ |
| Phase 13: Game Templates | +9 | Templates: expansion |
| Phase 14: Puzzle Games | +16 | Organisms: puzzles/ |
| Phase 15: Physics Sim | +3 | Organisms: physics-sim/ |
| Phase 16: Specialized Views | +8 | Organisms: various |
| **Total** | **+132** | **13% → 100%** |

## Migration from @almadar/ui

### Web to Mobile Mapping

| Web (@almadar/ui) | Mobile (@almadar/mobile) |
|-------------------|--------------------------|
| `onClick` | `onPress` |
| `className` | `style` (ViewStyle) |
| `action` | `action` (same) |
| `eventBus.emit('EVENT')` | `eventBus.emit('UI:EVENT')` |

### Example Migration

**Web:**
```tsx
<Button 
  onClick={() => {}}
  className="my-button"
>
  Click
</Button>
```

**Mobile:**
```tsx
<Button 
  onPress={() => {}}
  style={{ marginTop: 8 }}
>
  Click
</Button>
```

## License

MIT
