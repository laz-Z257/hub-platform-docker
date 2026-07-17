import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProviderWrapper } from "../src/components/SafeAreaProviderWrapper";
import { AuthProvider } from "../src/contexts/AuthContext";
import { ConnectivityProvider } from "../src/contexts/ConnectivityContext";
import { OfflineBanner } from "../src/components/OfflineBanner";
import "../global.css";

try { SplashScreen.preventAutoHideAsync(); } catch {}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      await SplashScreen.hideAsync().catch(() => {});
      setIsReady(true);
    };
    prepare();
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProviderWrapper>
        <ConnectivityProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="chat" />
            <Stack.Screen name="reportar" />
            <Stack.Screen name="historial" />
            <Stack.Screen name="exito" />
            <Stack.Screen name="incidente/[id]" />
            <Stack.Screen name="ajustes" />
          </Stack>
        </AuthProvider>
        </ConnectivityProvider>
      </SafeAreaProviderWrapper>
    </GestureHandlerRootView>
  );
}
