import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/providers/ThemeProvider';

// Main App component - shown when STORYBOOK_ENABLED is not set
function MainApp() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Text style={styles.title}>@almadar/mobile</Text>
        <Text style={styles.subtitle}>154 Components Ready</Text>
        <Text style={styles.description}>
          Run with STORYBOOK_ENABLED=true to view Storybook
        </Text>
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#14b8a6',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 18,
    marginBottom: 20,
  },
  description: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});

// Check if Storybook mode is enabled
// EXPO_PUBLIC_* vars are automatically inlined by Expo SDK 49+ without any babel plugin
const SHOW_STORYBOOK = process.env.EXPO_PUBLIC_STORYBOOK === 'true';

let ExportedApp: React.FC = MainApp;

if (SHOW_STORYBOOK) {
  // Import Storybook UI when enabled
  const Storybook = require('./.storybook').default;
  ExportedApp = Storybook;
}

export default ExportedApp;
