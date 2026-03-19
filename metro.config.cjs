const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force project root to this directory (not the monorepo root)
// Without this, Metro follows the .git submodule pointer up to kflow.ai.builder/
config.projectRoot = __dirname;
config.watchFolders = [__dirname];

// Ensure Metro resolves .cjs files
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
