import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  return new Proxy(
    {},
    {
      get: (_, prop) => (props: any) => React.createElement('Icon', { ...props, name: prop }),
    }
  );
});

import { computeTrajectory } from '@/components/BiomarkerTrendChart';
import { exportReportSummaryAsPdf } from '@/services/pdfExport';
import {
  scheduleRetestReminder,
  scheduleDailyMealCheckIn,
  cancelRetestReminders,
  cancelDailyMealCheckIn,
} from '@/services/notifications';
import { requestAccountDeletion } from '@/services/api';
import { clearAllTables } from '@/db/database';
import { MOCK_REPORT_DATA } from '@/data/mock';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
  }),
}));

// Mock expo-print and expo-sharing
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file:///data/report_summary.pdf' }),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif_12345'),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([
    { identifier: 'notif_meal_1', content: { data: { type: 'daily_meal_checkin' } } },
    { identifier: 'notif_retest_1', content: { data: { type: 'biomarker_retest' } } },
  ]),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    TIME_INTERVAL: 'timeInterval',
  },
  AndroidImportance: {
    HIGH: 4,
    DEFAULT: 3,
  },
}));

describe('Biomarker Trajectory Computation', () => {
  it('correctly labels trajectory as "improved" when value moves closer to normal', () => {
    // Ferritin optimal: 30 - 200. Value was 18, then improved to 28
    const history = [
      { value: 18, label: 'Oct 23' },
      { value: 28, label: 'Jan 24' },
    ];
    const result = computeTrajectory(history, 30, 200);
    expect(result.status).toBe('improved');
    expect(result.label).toBe('IMPROVED');
    expect(result.summary).toContain('moving closer');
  });

  it('correctly labels trajectory as "worsened" when value moves further from normal', () => {
    // Fasting Glucose optimal: 70 - 99. Value was 110, then worsened to 135
    const history = [
      { value: 110, label: 'Oct 23' },
      { value: 135, label: 'Jan 24' },
    ];
    const result = computeTrajectory(history, 70, 99);
    expect(result.status).toBe('worsened');
    expect(result.label).toBe('WORSENED');
    expect(result.summary).toContain('further away');
  });

  it('correctly labels trajectory as "stable" when both values are within optimal range', () => {
    // Hemoglobin optimal: 13.0 - 17.0. Value was 14.5, now 14.8
    const history = [
      { value: 14.5, label: 'Oct 23' },
      { value: 14.8, label: 'Jan 24' },
    ];
    const result = computeTrajectory(history, 13.0, 17.0);
    expect(result.status).toBe('stable');
    expect(result.label).toBe('STABLE');
  });

  it('handles single test baseline', () => {
    const history = [{ value: 14.5, label: 'Oct 23' }];
    const result = computeTrajectory(history, 13.0, 17.0);
    expect(result.status).toBe('stable');
    expect(result.label).toBe('STABLE');
    expect(result.summary).toContain('Baseline');
  });
});

describe('PDF Export Service (expo-print and expo-sharing)', () => {
  it('generates a PDF summary and opens native sharing', async () => {
    const res = await exportReportSummaryAsPdf({
      report: MOCK_REPORT_DATA,
      profile: {
        name: 'Alex Rivera',
        age: 30,
        sex: 'male',
        height: '178 cm',
        weight: '74 kg',
        dietType: 'veg',
        allergies: ['Peanuts'],
        goals: ['Rebuild Iron'],
        email: 'alex@example.com',
        isOnboarded: true,
      },
      foodRecommendations: [
        {
          id: 'rec_1',
          food: 'Palak Dal Tadka',
          category: 'Iron & Folate',
          type: 'eat_more',
          reason: 'Rich in bioavailable non-heme iron and vitamin C.',
          servingAdvice: '1 bowl with lunch',
        },
      ],
    });

    expect(res.success).toBe(true);
    expect(res.uri).toBe('file:///data/report_summary.pdf');
    expect(Print.printToFileAsync).toHaveBeenCalled();
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      'file:///data/report_summary.pdf',
      expect.objectContaining({ mimeType: 'application/pdf' })
    );
  });
});

describe('Local Notifications Service (expo-notifications)', () => {
  it('schedules a retest reminder with a 60-day interval', async () => {
    const id = await scheduleRetestReminder('Ferritin', 60);
    expect(id).toBe('notif_12345');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining('Retest Due: Ferritin'),
        }),
      })
    );
  });

  it('schedules daily meal check-in at 8:00 PM', async () => {
    const id = await scheduleDailyMealCheckIn(20, 0);
    expect(id).toBe('notif_12345');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining('Daily Nutrition Check-In'),
        }),
        trigger: expect.objectContaining({
          hour: 20,
          minute: 0,
        }),
      })
    );
  });

  it('cancels scheduled notifications by tag', async () => {
    await cancelDailyMealCheckIn();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif_meal_1');

    await cancelRetestReminders();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif_retest_1');
  });
});

describe('Data Deletion & Account Purge', () => {
  it('calls remote account deletion endpoint', async () => {
    const res = await requestAccountDeletion();
    expect(res.success).toBe(true);
    expect(res.message).toContain('purged');
  });

  it('clears all SQLite tables', async () => {
    await expect(clearAllTables()).resolves.not.toThrow();
  });
});
