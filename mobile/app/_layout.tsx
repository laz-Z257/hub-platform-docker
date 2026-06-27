import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { SafeAreaProviderWrapper } from "../src/components/SafeAreaProviderWrapper";
import { AuthProvider } from "../src/contexts/AuthContext";
import "../global.css";

try { SplashScreen.preventAutoHideAsync(); } catch {}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProviderWrapper>
        <AuthProvider>
          <StatusBar style="dark" />
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
      </SafeAreaProviderWrapper>
    </GestureHandlerRootView>
  );
}
