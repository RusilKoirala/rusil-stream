const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch monorepo root and packages (merge with existing watchFolders)
config.watchFolders = [
  ...(config.watchFolders || []),
  monorepoRoot
];

// Resolve modules from both project and monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Fix monorepo entry point resolution — Expo's AppEntry.js does ../../App
// which from node_modules/expo/ resolves to monorepo root, not apps/mobile
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '../../App') {
    return {
      filePath: path.resolve(projectRoot, 'App.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
