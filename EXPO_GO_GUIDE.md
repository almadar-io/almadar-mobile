# Using Expo Go with @almadar/mobile Storybook

## Quick Start

### 1. Install Expo Go on Your Phone
- **iOS**: Download from App Store
- **Android**: Download from Play Store

### 2. Start the Development Server

```bash
# Navigate to the package
cd packages/almadar-mobile

# Start with normal app
npm start
# or
npx expo start

# Start with Storybook
npm run storybook
# or
STORYBOOK_ENABLED=true npx expo start
```

### 3. Scan the QR Code
- Open Expo Go app on your phone
- Scan the QR code shown in the terminal
- The app will load on your device

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server (normal app) |
| `npm run start:storybook` | Start Expo dev server with Storybook |
| `npm run ios` | Start iOS simulator |
| `npm run android` | Start Android emulator |
| `npm run web` | Start web version |
| `npm run storybook` | Start Storybook on device |
| `npm run storybook:ios` | Start Storybook on iOS simulator |
| `npm run storybook:android` | Start Storybook on Android emulator |
| `npm run storybook:web` | Start Storybook in browser |

## How It Works

The app uses an environment variable (`STORYBOOK_ENABLED`) to toggle between:
- **Normal App**: Shows a placeholder screen
- **Storybook**: Shows the Storybook UI with all 154 components

When you run `npm run storybook`, it sets `STORYBOOK_ENABLED=true` before starting Expo.

## Troubleshooting

### Metro Bundler Issues
If you see module resolution errors:
```bash
# Clear Metro cache
npx expo start --clear

# Or
npm start -- --clear
```

### Storybook Not Showing
Make sure you're using the storybook script:
```bash
# This shows Storybook
npm run storybook

# This shows the normal app
npm start
```

### Components Not Loading
Regenerate the Storybook story list:
```bash
npm run storybook-generate
```

### Phone Can't Connect
- Make sure your phone and computer are on the same WiFi network
- Try using a tunnel:
  ```bash
  npm run storybook -- --tunnel
  ```

## Viewing Components

Once Storybook is running on your device:
1. Tap the Storybook logo to see the story list
2. Browse components by category (Atoms, Molecules, Organisms)
3. Tap any component to view its stories
4. Use the controls panel to modify props in real-time

## Tips

- **Shake gesture**: Opens developer menu on device
- **Fast Refresh**: Changes update automatically
- **Props Panel**: Swipe from right to see component controls
- **Actions Panel**: Swipe from left to see event logs
