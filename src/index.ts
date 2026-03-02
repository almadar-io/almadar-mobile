/**
 * @almadar/mobile
 * React Native UI components for Almadar
 * 
 * This package extends @almadar/ui with React Native-specific implementations
 * while reusing platform-agnostic hooks, utilities, and types.
 */

// Re-export hooks (mostly from @almadar/ui)
export * from './hooks';

// Re-export utilities (mostly from @almadar/ui)
export * from './lib';

// Re-export providers
export * from './providers';

// Visual components (React Native implementations)
export * from './components/atoms';
export * from './components/molecules';
export * from './components/organisms';
export * from './components/templates';
