import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { api } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications only work on physical devices");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await api.post("/push/register", { token });
    return token;
  } catch (err) {
    console.error("Error registering push token:", err);
    return null;
  }
}

export function setupNotificationListeners(handleNotification: (data: Record<string, unknown>) => void) {
  // When app is in foreground
  const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data || {};
    handleNotification(data as Record<string, unknown>);
  });

  // When user taps on notification (app in background/killed)
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data || {};
    handleNotification(data as Record<string, unknown>);
  });

  return () => {
    foregroundSub.remove();
    responseSub.remove();
  };
}
