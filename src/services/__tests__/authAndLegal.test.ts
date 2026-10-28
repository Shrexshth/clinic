import {
  validateHttpsUrl,
  sendEmailOtp,
  verifyEmailOtp,
  getAuthSession,
  signOutUser,
  ExpoSecureStoreAdapter,
} from '@/services/supabase';
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerHeavyHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
  triggerWarningHaptic,
} from '@/utils/haptics';

// Mock expo-secure-store
const mockStore: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockStore[key] || null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockStore[key] = value;
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete mockStore[key];
  }),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('Supabase Auth & HTTPS Enforcement', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockStore)) {
      delete mockStore[key];
    }
  });

  describe('validateHttpsUrl', () => {
    it('allows valid HTTPS endpoints', () => {
      const url = 'https://xyzcompany.supabase.co';
      expect(validateHttpsUrl(url)).toBe(url);
    });

    it('rejects unencrypted HTTP endpoints with strict security error', () => {
      const insecureUrl = 'http://insecure-supabase.internal';
      expect(() => validateHttpsUrl(insecureUrl)).toThrow(
        /SECURITY VIOLATION: Insecure URL detected/i
      );
    });

    it('returns null for empty or undefined url', () => {
      expect(validateHttpsUrl(undefined)).toBeNull();
      expect(validateHttpsUrl('')).toBeNull();
    });
  });

  describe('sendEmailOtp & verifyEmailOtp', () => {
    it('validates email format before sending OTP', async () => {
      const invalidRes = await sendEmailOtp('not-an-email');
      expect(invalidRes.success).toBe(false);
      expect(invalidRes.message).toMatch(/valid email/i);
    });

    it('dispatches demo OTP and saves to SecureStore in offline fallback mode', async () => {
      const email = 'user@example.com';
      const sendRes = await sendEmailOtp(email);
      expect(sendRes.success).toBe(true);
      expect(sendRes.isMock).toBe(true);

      // Verify that the code was stored in mockStore
      const stored = mockStore[`demo_otp_${email}`];
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored);
      expect(parsed.code).toBe('123456');
    });

    it('rejects incorrect OTP tokens', async () => {
      const email = 'alex@example.com';
      await sendEmailOtp(email);

      const failRes = await verifyEmailOtp(email, '999999');
      expect(failRes.success).toBe(false);
      expect(failRes.message).toMatch(/Invalid verification code/i);
    });

    it('successfully verifies correct OTP and persists session via SecureStore', async () => {
      const email = 'alex@example.com';
      await sendEmailOtp(email);

      const verifyRes = await verifyEmailOtp(email, '123456');
      expect(verifyRes.success).toBe(true);
      expect(verifyRes.session).toBeDefined();
      expect(verifyRes.user?.email).toBe(email);

      // Verify session is retrieved by getAuthSession
      const session = await getAuthSession();
      expect(session).toBeDefined();
      expect(session?.user?.email).toBe(email);
    });

    it('clears session tokens from SecureStore on signOutUser', async () => {
      const email = 'alex@example.com';
      await sendEmailOtp(email);
      await verifyEmailOtp(email, '123456');

      expect(await getAuthSession()).not.toBeNull();

      await signOutUser();
      expect(await getAuthSession()).toBeNull();
    });
  });
});

describe('Tactile Haptic Feedback Utility', () => {
  it('triggers haptics without throwing errors', async () => {
    await expect(triggerLightHaptic()).resolves.toBeUndefined();
    await expect(triggerMediumHaptic()).resolves.toBeUndefined();
    await expect(triggerHeavyHaptic()).resolves.toBeUndefined();
    await expect(triggerSuccessHaptic()).resolves.toBeUndefined();
    await expect(triggerErrorHaptic()).resolves.toBeUndefined();
    await expect(triggerWarningHaptic()).resolves.toBeUndefined();
  });
});
