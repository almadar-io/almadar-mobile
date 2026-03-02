const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the workspace root
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Watch all files in the workspace
config.watchFolders = [workspaceRoot];

// Resolve modules from the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Add extra node modules to resolve monorepo packages
config.resolver.extraNodeModules = {
  '@almadar/ui': path.resolve(workspaceRoot, 'packages/almadar-ui'),
  '@almadar/core': path.resolve(workspaceRoot, 'packages/almadar-core'),
  '@almadar/patterns': path.resolve(workspaceRoot, 'packages/almadar-patterns'),
  '@almadar/evaluator': path.resolve(workspaceRoot, 'packages/almadar-evaluator'),
};

// Support for symlinked packages
config.resolver.disableHierarchicalLookup = false;

// Ensure Metro resolves .cjs files
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
