#!/bin/sh
set -e

echo "=== Building Android APK ==="
echo "ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

# Ensure local.properties points to the Android SDK
echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties

# Build the APK
cd android
./gradlew assembleRelease

echo "=== Build complete ==="

# Copy APK to output volume if mounted
APK_SRC="app/build/outputs/apk/release/app-release.apk"
APK_DST="/output/app-release.apk"

if [ -f "$APK_SRC" ]; then
  mkdir -p /output
  cp "$APK_SRC" "$APK_DST"
  echo "APK copied to $APK_DST"
  ls -lh "$APK_DST"
else
  echo "WARNING: Release APK not found at $APK_SRC"
  # Try debug as fallback
  DEBUG_APK="app/build/outputs/apk/debug/app-debug.apk"
  if [ -f "$DEBUG_APK" ]; then
    mkdir -p /output
    cp "$DEBUG_APK" /output/app-debug.apk
    echo "Debug APK copied to /output/app-debug.apk"
    ls -lh /output/app-debug.apk
  else
    echo "ERROR: No APK found to copy"
    exit 1
  fi
fi
