const { withGradleProperties } = require('@expo/config-plugins');
const { updateAndroidBuildProperty } = require('@expo/config-plugins/build/android/BuildProperties');

/**
 * Expo Config Plugin to optimize and compress Android APK build size.
 *
 * 1. Restricts compiled native architectures (.so files) to 'arm64-v8a' (or custom via EXPO_ANDROID_ARCHS),
 *    which drops redundant binaries for x86, x86_64, and 32-bit devices, cutting APK size from ~90MB to ~25MB.
 * 2. Enables R8 fullMode optimization for tighter bytecode compression.
 */
module.exports = function withAndroidCompress(config, options = {}) {
  return withGradleProperties(config, (config) => {
    const architectures = process.env.EXPO_ANDROID_ARCHS || options.architectures || 'arm64-v8a';

    // Restrict React Native architectures to reduce .so duplicate binaries
    updateAndroidBuildProperty(
      config.modResults,
      'reactNativeArchitectures',
      architectures
    );

    // Enable R8 full optimization mode
    updateAndroidBuildProperty(
      config.modResults,
      'android.enableR8.fullMode',
      'true'
    );

    return config;
  });
};
