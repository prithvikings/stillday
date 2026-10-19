import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications behave while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Ask the user for notification permission.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("reminders", {
        name: "Habit reminders",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      });
    }

    const currentPermission = await Notifications.getPermissionsAsync();

    let granted = currentPermission.granted;

    if (!granted) {
      const requestedPermission = await Notifications.requestPermissionsAsync();

      granted = requestedPermission.granted;
    }

    return granted;
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return false;
  }
}

/**
 * Schedule a repeating daily reminder.
 * Returns its notification ID, which can be used to cancel it later.
 */
export async function scheduleDailyReminder(
  title: string,
  body: string,
  hour: number,
  minute: number,
): Promise<string> {
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Invalid reminder time.");
  }

  const permitted = await requestNotificationPermission();

  if (!permitted) {
    throw new Error("Notification permission has not been granted.");
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      ...(Platform.OS === "android" ? { channelId: "reminders" } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === "android" ? { channelId: "reminders" } : {}),
    },
  });
}

/**
 * Cancel a previously scheduled notification.
 */
export async function cancelReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
