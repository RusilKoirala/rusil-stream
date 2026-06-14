const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "@assets": path.resolve(__dirname, "assets"),
};

module.exports = withNativeWind(config, {
  input: "./global.css",
});
