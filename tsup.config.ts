import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/components/index.ts',
    'src/components/atoms/index.ts',
    'src/components/molecules/index.ts',
    'src/components/organisms/index.ts',
    // 'src/components/templates/index.ts',  // Will be added when implemented
    'src/hooks/index.ts',
    'src/providers/index.ts',
    'src/lib/index.ts',
  ],
  format: ['esm'],
  dts: false, // TypeScript handles declarations separately
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-native',
    '@almadar/ui',
    '@almadar/core',
    '@almadar/patterns',
    '@react-navigation/native',
    'react-native-safe-area-context',
    'react-native-vector-icons',
  ],
  platform: 'neutral',
  target: 'es2020',
});
