# @almadar/mobile

React Native UI components for Almadar - extends `@almadar/ui` with mobile-specific implementations.

## Installation

```bash
npm install @almadar/mobile
# or
yarn add @almadar/mobile
# or
pnpm add @almadar/mobile
```

## Peer Dependencies

```bash
npm install react react-native @react-navigation/native react-native-safe-area-context
```

## Usage

```tsx
import { Button, VStack, Typography } from '@almadar/mobile';

function App() {
  return (
    <VStack spacing={16}>
      <Typography variant="h1">Hello, Almadar!</Typography>
      <Button variant="primary" onPress={() => {}}>
        Get Started
      </Button>
    </VStack>
  );
}
```

## Components

### Atoms
- `Button` - Touchable button with variants (primary, secondary, ghost, destructive)
- `Stack` (VStack, HStack, Box) - Layout components
- `Typography` - Text components (H1-H4, Body, Caption, etc.)
- `Input` - Text input with label and error handling
- `Card` - Container component
- `Badge` - Status/tag component
- `Icon` - Icon wrapper

### Molecules
- `LoadingState` - Loading spinner with message
- `ErrorState` - Error display with retry button
- `EmptyState` - Empty state placeholder
- `List` - FlatList wrapper with loading/error states
- `FormField` - Form input with label and validation
- `Modal` - Modal dialog with header/footer
- `Drawer` - Side drawer navigation

### Organisms
- `EntityList` - List view for entities
- `EntityCard` - Card display for entities
- `FormSection` - Grouped form layout
- `CardGrid` - Grid layout for cards
- `DetailPanel` - Detail view panel

## Storybook

Run Storybook to see all components:

```bash
npm run storybook:ios
# or
npm run storybook:android
```

## Development

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Run type checker
npm run typecheck

# Build package
npm run build
```

## Architecture

This package extends `@almadar/ui` and reuses:
- Hooks (`useEventBus`, `useTraitState`, etc.)
- Utilities (`cn`, theme system)
- Types and interfaces

Only visual components are implemented specifically for React Native.

## License

MIT
