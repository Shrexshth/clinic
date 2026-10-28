// ============================================================================
// src/utils/haptics.ts
//
// Cross-platform tactile haptic feedback utility using expo-haptics.
// Provides Material-style ripple feedback on Android and subtle taptics on iOS.
// Gracefully no-ops when hardware haptics are unsupported or muted.
// ============================================================================

import * as Haptics from 'expo-haptics';

/**
 * Triggers light tactile feedback for subtle interactions (pills, tabs, selections).
 */
export async function triggerLightHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Graceful no-op on unsupported hardware
  }
}

/**
 * Triggers medium tactile feedback for standard button presses, modal opens, and swaps.
 */
export async function triggerMediumHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Graceful no-op
  }
}

/**
 * Triggers heavy tactile feedback for significant or destructive actions (e.g. data purge).
 */
export async function triggerHeavyHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // Graceful no-op
  }
}

/**
 * Triggers success haptic notification (e.g. verified OTP, marked eaten, saved report).
 */
export async function triggerSuccessHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Graceful no-op
  }
}

/**
 * Triggers error haptic notification (e.g. invalid OTP, validation failure).
 */
export async function triggerErrorHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Graceful no-op
  }
}

/**
 * Triggers warning haptic notification.
 */
export async function triggerWarningHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Graceful no-op
  }
}
