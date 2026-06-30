FROM node:22-bullseye-slim

# Install Java 17 (required for Android SDK tools and Gradle)
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk-headless wget unzip && \
    rm -rf /var/lib/apt/lists/*

# Install Android SDK command-line tools
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools

RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip && \
    unzip -q /tmp/cmdline-tools.zip -d $ANDROID_SDK_ROOT/cmdline-tools && \
    mv $ANDROID_SDK_ROOT/cmdline-tools/cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/latest && \
    rm /tmp/cmdline-tools.zip

# Accept licenses and install required SDK components
RUN yes | sdkmanager --licenses > /dev/null 2>&1 && \
    sdkmanager \
      "platform-tools" \
      "platforms;android-36" \
      "build-tools;36.0.0" \
      > /dev/null 2>&1

WORKDIR /app

# Copy dependency manifests first (leverages Docker layer caching)
COPY mobile/package.json mobile/package-lock.json ./mobile/
COPY shared/package.json ./shared/ 2>/dev/null || true
RUN cd mobile && npm ci

# Copy the rest of the source
COPY shared/ ./shared/
COPY mobile/ ./mobile/

# Prebuild the Android native project
RUN cd mobile && npx expo prebuild --platform android --no-install

# Default: build APK and copy to /output volume
WORKDIR /app/mobile
CMD ["./scripts/build-apk.sh"]
