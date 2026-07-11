import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProviderWrapper } from "../src/components/SafeAreaProviderWrapper";
import { AuthProvider } from "../src/contexts/AuthContext";
import { ConnectivityProvider } from "../src/contexts/ConnectivityContext";
import { OfflineBanner } from "../src/components/OfflineBanner";
import "../global.css";

try { SplashScreen.preventAutoHideAsync(); } catch {}

// Web PWA usa fuentes del sistema (no descarga nada)
const fontsLoaded = true;

export default function RootLayout() {
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
