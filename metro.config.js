let getDefaultConfig, mergeConfig;
try { const pkg = '@react-native/metro-config'; ({getDefaultConfig, mergeConfig} = require(pkg)); } catch (e) {
  // Snack environment: metro config package may be absent. Export empty config.
  module.exports = {};
  return;
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
