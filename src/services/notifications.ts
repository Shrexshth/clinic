// ============================================================================
// src/services/notifications.ts
//
// Local notification service via expo-notifications.
// Manages:
// - Retest reminders for flagged biomarkers (e.g. 30/60/90 days after report)
// - Daily meal plan check-in reminders (e.g. 8:00 PM evening check-in)
// - Channel setup for Android and cross-platform permissions
// ============================================================================

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NOTIFICATION_CHANNELS = {
  RETEST: 'clinixbridge_retest',
  MEALS: 'clinixbridge_meals',
};

export const NOTIFICATION_TAGS = {
  DAILY_MEAL: 'tag_daily_meal_checkin',
  RETEST_PREFIX: 'tag_retest_',
};

/**
 * Initializes notification channels on Android.
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.RETEST, {
      name: 'Biomarker Retest Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#B3141F',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.MEALS, {
      name: 'Daily Meal Check-ins',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#6E0B14',
      sound: 'default',
    });
  }
}

/**
 * Requests permissions to send local notifications.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      await setupNotificationChannels();
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Error requesting notification permissions:', err);
    return false;
  }
}

/**
 * Schedules a daily meal check-in reminder at a specified hour and minute.
 */
export async function scheduleDailyMealCheckIn(
  hour: number = 20,
  minute: number = 0
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Cancel existing meal check-in first
    await cancelDailyMealCheckIn();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍽️ Daily Nutrition Check-In',
        body: 'Did you stay on track with your blood-tailored meals today? Tap to mark your eaten items in ClinixBridge.',
        data: { type: 'daily_meal_checkin' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: NOTIFICATION_CHANNELS.MEALS,
      },
    });

    return id;
  } catch (err) {
    console.warn('Error scheduling daily meal check-in:', err);
    return null;
  }
}

/**
 * Cancels all scheduled daily meal check-in notifications.
 */
export async function cancelDailyMealCheckIn(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === 'daily_meal_checkin') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (err) {
    console.warn('Error cancelling daily meal check-in:', err);
  }
}

/**
 * Schedules a local retest reminder for a flagged biomarker after X days.
 */
export async function scheduleRetestReminder(
  biomarkerName: string,
  daysAhead: number = 60
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Convert days into seconds (or at least 10s if test/debug)
    const seconds = Math.max(10, daysAhead * 24 * 60 * 60);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🩸 Retest Due: ${biomarkerName}`,
        body: `It has been ${daysAhead} days since your flagged test. Schedule a routine laboratory blood test to check your nutritional response.`,
        data: { type: 'biomarker_retest', biomarkerName, daysAhead },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
        channelId: NOTIFICATION_CHANNELS.RETEST,
      },
    });

    return id;
  } catch (err) {
    console.warn(`Error scheduling retest reminder for ${biomarkerName}:`, err);
    return null;
  }
}

/**
 * Schedules immediate or debug notification for instant user verification.
 */
export async function triggerTestNotification(
  title: string = 'ClinixBridge Active',
  body: string = 'Notification system is fully active and scheduled for your health plan.'
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (err) {
    console.warn('Error triggering test notification:', err);
    return null;
  }
}

/**
 * Cancels all scheduled retest reminders.
 */
export async function cancelRetestReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === 'biomarker_retest') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (err) {
    console.warn('Error cancelling retest reminders:', err);
  }
}

/**
 * Cancels all notifications scheduled by ClinixBridge.
 */
export async function cancelAllAppNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('Error cancelling all notifications:', err);
  }
}
