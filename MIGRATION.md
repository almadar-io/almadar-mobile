# Migration Guide: @almadar/ui to @almadar/mobile

This guide helps you migrate components from web (@almadar/ui) to mobile (@almadar/mobile).

## Key Differences

### Event Handling

| Web | Mobile |
|-----|--------|
| `onClick` | `onPress` |
| `onChange` | `onChange` (same) |
| `onSubmit` | `onPress` (Button) |

### Styling

| Web | Mobile |
|-----|--------|
| `className` | `style` (ViewStyle/TextStyle) |
| Tailwind classes | StyleSheet objects |
| CSS variables | Theme object from useTheme() |

### Layout

| Web | Mobile |
|-----|--------|
| `div` | `View` |
| `span`, `p` | `Text` |
| Flexbox default | Flexbox with explicit props |

## Component Mappings

### Atoms

| Web Component | Mobile Component | Notes |
|--------------|------------------|-------|
| Button | Button | Same props, `onPress` instead of `onClick` |
| Input | Input | Same props |
| Card | Card | Same props |
| Badge | Badge | Same props |
| Typography | Typography | Same variants (h1-h4, body, caption, label) |
| Stack | VStack/HStack | Use VStack (column) or HStack (row) |
| Avatar | Avatar | Same props |
| Checkbox | Checkbox | `onChange` → checked boolean |
| Radio | Radio | `onChange` → checked boolean |
| Switch | Switch | `onChange` → checked boolean |

### Molecules

| Web Component | Mobile Component | Notes |
|--------------|------------------|-------|
| Tabs | Tabs | Horizontal scrollable by default |
| Modal | Modal | Uses React Native Modal |
| Alert | Alert | Swipe to dismiss |
| Toast | Toast | Animated, auto-dismiss |
| Skeleton | Skeleton | Shimmer animation |
| Tooltip | Tooltip | Long-press triggered |

### Organisms

| Web Component | Mobile Component | Notes |
|--------------|------------------|-------|
| Header | Header | Back button, safe area aware |
| DataTable | DataTable | Horizontal scroll |
| StatCard | StatCard | Same props |
| Timeline | Timeline | Vertical layout |

## Props Migration

### Closed Circuit Props

All mobile components implement closed circuit props:

```tsx
// Web
<Button isLoading={loading}>

// Mobile  
<Button isLoading={loading}> // Same API!
```

### Event Bus

Event bus API is identical:

```tsx
// Web
<Button action="SAVE" actionPayload={{ id: 1 }}>

// Mobile
<Button action="SAVE" actionPayload={{ id: 1 }}> // Same API!
```

### Form Components

```tsx
// Web
<Input 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Mobile
<Input
  value={value}
  onChangeText={setValue}  // Different: direct string
  changeEvent="INPUT_CHANGED"  // Optional: eventBus
/>
```

## Styling Migration

### Converting Tailwind to StyleSheet

```tsx
// Web - Tailwind
<div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">

// Mobile - StyleSheet
<VStack 
  align="center" 
  style={{
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    ...theme.shadows.main,
  }}
>
```

### Using Theme Values

```tsx
import { useTheme } from '@almadar/mobile';

function Component() {
  const theme = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
    }} />
  );
}
```

### Theme Hook

```tsx
import { useThemeStyles } from '@almadar/mobile';

function Component() {
  const styles = useThemeStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.card,
      padding: theme.spacing[4],
    },
  }));
  
  return <View style={styles.container} />;
}
```

## Common Patterns

### Form Handling

```tsx
// Web
<form onSubmit={handleSubmit}>
  <Input name="email" />
  <Button type="submit">Submit</Button>
</form>

// Mobile
<VStack spacing={12}>
  <Input 
    value={email}
    onChangeText={setEmail}
    label="Email"
  />
  <Button 
    onPress={handleSubmit}
    action="FORM_SUBMIT"
  >
    Submit
  </Button>
</VStack>
```

### Navigation

```tsx
// Web - Next.js
import { useRouter } from 'next/router';
const router = useRouter();
<Button onClick={() => router.push('/home')}>

// Mobile - React Navigation
import { useNavigation } from '@almadar/mobile';
const navigation = useNavigation();
<Button onPress={() => navigation.navigate('Home')}>
```

### Data Fetching with Entity

```tsx
// Both web and mobile
<EntityCard
  entity="User"
  entityId={userId}
/>
```

## TypeScript Types

### Web Types
```tsx
import type { ButtonProps } from '@almadar-ui/components/atoms/Button';
```

### Mobile Types
```tsx
import type { ButtonProps } from '@almadar/mobile';
```

## Testing

### Web Testing
```tsx
import { render, fireEvent } from '@testing-library/react';
fireEvent.click(screen.getByText('Button'));
```

### Mobile Testing
```tsx
import { render, fireEvent } from '@testing-library/react-native';
fireEvent.press(screen.getByText('Button'));
```

## Gotchas

### 1. Touch Targets
Mobile requires minimum 44x44 touch targets. The mobile components handle this automatically.

### 2. Keyboard Handling
Mobile needs KeyboardAvoidingView for forms. Use AuthLayout or implement manually.

### 3. Scroll Views
Mobile lists should use FlatList for virtualization. EntityList uses FlatList internally.

### 4. Safe Areas
Use SafeAreaView or the provided layout components (Header, DashboardLayout) which handle safe areas.

### 5. Platform Differences
Some components adapt to platform:
- Select uses ActionSheet on iOS, Modal on Android
- Date pickers are platform-specific

## Checklist

- [ ] Replace `onClick` with `onPress`
- [ ] Replace `className` with `style`
- [ ] Replace `div`/`span` with `View`/`Text` equivalents
- [ ] Add ThemeProvider at app root
- [ ] Add EventBusProvider at app root
- [ ] Test on both iOS and Android
- [ ] Verify touch targets are adequate
- [ ] Test with keyboard open

## Support

For questions or issues:
- Check the [README](./README.md)
- Review [AGENTS.md](../../AGENTS.md)
- Open an issue on GitHub
