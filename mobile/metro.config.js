const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.resolver.blockList = [
  /android\/.*/,
  /\.cxx\/.*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });
