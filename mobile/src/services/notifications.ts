import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { api } from "./api";
import { logger } from "./logger";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }
  if (!Device.isDevice) {
    logger.info("Push notifications only work on physical devices");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    logger.info("Push notification permission not granted");
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await api.post("/push/register", { token });
    return token;
  } catch (err) {
    logger.error("Error registering push token", { error: (err as Error).message });
    return null;
  }
}

export function setupNotificationListeners(handleNotification: (data: Record<string, unknown>) => void) {
  if (Platform.OS === "web") {
    return () => {};
  }

  const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data || {};
    handleNotification(data as Record<string, unknown>);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data || {};
    handleNotification(data as Record<string, unknown>);
  });

  return () => {
    foregroundSub.remove();
    responseSub.remove();
  };
}
