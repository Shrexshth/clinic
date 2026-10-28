// ============================================================================
// src/services/supabase.ts
//
// Supabase Authentication client with Email OTP.
// Security rules:
// - Stores tokens securely via expo-secure-store (Hardware-backed Keystore / Keychain)
// - STRICT ENFORCEMENT: HTTPS only (rejects unencrypted HTTP connections)
// - Never stores secret keys in client code; reads public anon key & URL from environment
// - Supports offline demo OTP mode when backend is offline or unconfigured
// ============================================================================

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

/**
 * Custom SecureStore storage adapter for Supabase session persistence.
 */
export const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.warn('SecureStore getItem error:', err);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.warn('SecureStore setItem error:', err);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.warn('SecureStore removeItem error:', err);
    }
  },
};

const MOCK_STORAGE_KEY = 'clinixbridge_mock_auth_session';

/**
 * Validates HTTPS protocol enforcement.
 * Throws security error if unencrypted HTTP is attempted.
 */
export function validateHttpsUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith('https://')) {
    throw new Error(
      `SECURITY VIOLATION: Insecure URL detected (${trimmed}). ClinixBridge strictly enforces HTTPS only for all network transmission.`
    );
  }
  return trimmed;
}

const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Strictly validate HTTPS if URL is configured
let validatedUrl: string | null = null;
if (rawSupabaseUrl) {
  try {
    validatedUrl = validateHttpsUrl(rawSupabaseUrl);
  } catch (err: any) {
    console.error(err.message);
  }
}

/**
 * Supabase client instance with SecureStore adapter.
 */
export const supabase: SupabaseClient | null =
  validatedUrl && supabaseAnonKey
    ? createClient(validatedUrl, supabaseAnonKey, {
        auth: {
          storage: ExpoSecureStoreAdapter,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export interface AuthResponse {
  success: boolean;
  message: string;
  session?: Session | null;
  user?: User | null;
  isMock?: boolean;
}

/**
 * Sends an Email OTP (One-Time Password / Magic Code).
 */
export async function sendEmailOtp(email: string): Promise<AuthResponse> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  // 1. If Supabase is configured with HTTPS, send real OTP
  if (supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: `A 6-digit verification code has been dispatched to ${normalizedEmail}.`,
      };
    } catch (err: any) {
      console.warn('Supabase OTP send failed:', err?.message);
    }
  }

  // 2. Offline / Demo Mode: Simulate OTP generation and store in SecureStore
  const demoCode = '123456';
  await ExpoSecureStoreAdapter.setItem(
    `demo_otp_${normalizedEmail}`,
    JSON.stringify({ code: demoCode, timestamp: Date.now() })
  );

  return {
    success: true,
    message: `Demo Mode: Verification code is ${demoCode} (dispatched to ${normalizedEmail}).`,
    isMock: true,
  };
}

/**
 * Verifies the 6-digit Email OTP code and establishes a secure session.
 */
export async function verifyEmailOtp(email: string, token: string): Promise<AuthResponse> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanedToken = token.trim();

  if (!cleanedToken || cleanedToken.length < 6) {
    return { success: false, message: 'Please enter a 6-digit verification code.' };
  }

  // 1. If Supabase is configured, verify with Supabase Auth
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanedToken,
        type: 'email',
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: 'Email successfully verified. Session established.',
        session: data.session,
        user: data.user,
      };
    } catch (err: any) {
      console.warn('Supabase verifyOtp failed:', err?.message);
    }
  }

  // 2. Offline / Demo Mode verification
  const storedOtpData = await ExpoSecureStoreAdapter.getItem(`demo_otp_${normalizedEmail}`);
  let isValid = cleanedToken === '123456';

  if (storedOtpData) {
    try {
      const parsed = JSON.parse(storedOtpData);
      if (parsed.code === cleanedToken) {
        isValid = true;
      }
    } catch {
      // fallback to 123456
    }
  }

  if (!isValid) {
    return { success: false, message: 'Invalid verification code. Please check and try again.' };
  }

  // Persist demo session in SecureStore
  const mockUser: User = {
    id: `usr_${Date.now()}`,
    app_metadata: {},
    user_metadata: { email: normalizedEmail },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: normalizedEmail,
  } as User;

  const mockSession: Session = {
    access_token: `mock_jwt_token_${Date.now()}`,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: `mock_refresh_${Date.now()}`,
    user: mockUser,
  };

  await ExpoSecureStoreAdapter.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockSession));

  return {
    success: true,
    message: 'Demo verification successful. Session secured.',
    session: mockSession,
    user: mockUser,
    isMock: true,
  };
}

/**
 * Returns current authenticated user session from SecureStore.
 */
export async function getAuthSession(): Promise<Session | null> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) return data.session;
    } catch {
      // fallback to mock
    }
  }

  const raw = await ExpoSecureStoreAdapter.getItem(MOCK_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Signs out and purges tokens from SecureStore.
 */
export async function signOutUser(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    }
  }

  await ExpoSecureStoreAdapter.removeItem(MOCK_STORAGE_KEY);
}
