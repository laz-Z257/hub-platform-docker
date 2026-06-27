import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { ReactNode } from "react";

if (Platform.OS === "web") {
  const original = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    try {
      return original.call(this, child);
    } catch (e) {
      if (e instanceof DOMException && e.name === "NotFoundError") {
        return child;
      }
      throw e;
    }
  };
}

export function SafeAreaProviderWrapper({ children }: { children: ReactNode }) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}
