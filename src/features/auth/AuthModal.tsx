// ============================================================================
// src/features/auth/AuthModal.tsx
//
// Supabase Authentication Modal via Email OTP (One-Time Password / Magic Code).
// Tokens persisted via expo-secure-store.
// Enforces HTTPS-only transmission and links directly to DPDP 2023 Consent & Privacy Policy.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  RefreshCw,
} from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { CircleArrowButton } from '@/components/CircleArrowButton';
import { sendEmailOtp, verifyEmailOtp, getAuthSession } from '@/services/supabase';
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
} from '@/utils/haptics';

export interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  onOpenDPDPConsent?: () => void;
}

export function AuthModal({
  visible,
  onClose,
  onSuccess,
  onOpenDPDPConsent,
}: AuthModalProps) {
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      await triggerErrorHaptic();
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      await triggerMediumHaptic();
      const res = await sendEmailOtp(trimmed);

      if (res.success) {
        await triggerSuccessHaptic();
        setStatusMessage(res.message);
        setStep('otp');
        setCountdown(60);
      } else {
        await triggerErrorHaptic();
        Alert.alert('Authentication Error', res.message);
      }
    } catch (err: any) {
      await triggerErrorHaptic();
      Alert.alert('Error', err?.message || 'Failed to dispatch verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleaned = otp.trim();
    if (cleaned.length < 6) {
      await triggerErrorHaptic();
      Alert.alert('Incomplete Code', 'Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setIsLoading(true);
      await triggerMediumHaptic();
      const res = await verifyEmailOtp(email, cleaned);

      if (res.success) {
        await triggerSuccessHaptic();
        Alert.alert(
          'Authentication Verified',
          'Session tokens securely saved to hardware Keystore via expo-secure-store.',
          [
            {
              text: 'Continue',
              onPress: () => {
                onSuccess(email);
                onClose();
              },
            },
          ]
        );
      } else {
        await triggerErrorHaptic();
        Alert.alert('Verification Failed', res.message);
      }
    } catch (err: any) {
      await triggerErrorHaptic();
      Alert.alert('Error', err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  const handleResetToEmail = async () => {
    await triggerLightHaptic();
    setStep('email');
    setOtp('');
    setStatusMessage('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <CircleArrowButton direction="left" onPress={onClose} size={38} />
          <View style={styles.topBarTitles}>
            <Text style={styles.topBarCategory} maxFontSizeMultiplier={1.3}>
              SUPABASE SECURE AUTH
            </Text>
            <Text style={styles.topBarName} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              {step === 'email' ? 'Sign In with Email' : 'Verify Magic Code'}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close authentication"
            android_ripple={{ color: Colors.ripple, borderless: true }}
            style={styles.closeIconButton}
          >
            <X size={20} color={Colors.text} strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner */}
          <View style={styles.heroBox}>
            <View style={styles.heroIconBox}>
              <KeyRound size={28} color={Colors.primary} strokeWidth={2.4} />
            </View>
            <Text style={styles.heroTitle} maxFontSizeMultiplier={1.3}>
              Passwordless Blood Intelligence
            </Text>
            <Text style={styles.heroSubtitle} maxFontSizeMultiplier={1.3}>
              Sign in securely via Email One-Time Password. We strictly transmit over HTTPS and store tokens in encrypted hardware Keystore via expo-secure-store.
            </Text>
          </View>

          {/* Step 1: Email Input */}
          {step === 'email' ? (
            <View style={styles.formCard}>
              <Text style={styles.inputLabel} maxFontSizeMultiplier={1.3}>
                Enter your Email Address
              </Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={Colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  placeholder="alex.rivera@example.com"
                  placeholderTextColor={Colors.secondaryText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  style={styles.textInput}
                  accessibilityLabel="Email input field"
                  maxFontSizeMultiplier={1.3}
                />
              </View>

              <Pressable
                onPress={handleSendOtp}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Send OTP Verification Code"
                android_ripple={{ color: Colors.rippleLight, borderless: false }}
                style={styles.primaryBtn}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText} maxFontSizeMultiplier={1.3}>
                      Send Magic OTP Code
                    </Text>
                    <ArrowRight size={16} color={Colors.white} strokeWidth={2.4} />
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            /* Step 2: 6-Digit OTP Input */
            <View style={styles.formCard}>
              {statusMessage ? (
                <View style={styles.statusBox}>
                  <CheckCircle2 size={16} color={Colors.statusNormal} />
                  <Text style={styles.statusText} maxFontSizeMultiplier={1.3}>
                    {statusMessage}
                  </Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel} maxFontSizeMultiplier={1.3}>
                6-Digit Verification Code
              </Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={Colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  placeholder="123456"
                  placeholderTextColor={Colors.secondaryText}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  style={[styles.textInput, styles.otpInput]}
                  accessibilityLabel="6 digit verification code input"
                  maxFontSizeMultiplier={1.3}
                />
              </View>

              <Pressable
                onPress={handleVerifyOtp}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Verify code and login"
                android_ripple={{ color: Colors.rippleLight, borderless: false }}
                style={styles.primaryBtn}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.primaryBtnText} maxFontSizeMultiplier={1.3}>
                    Verify & Authenticate
                  </Text>
                )}
              </Pressable>

              {/* Resend and Edit Actions */}
              <View style={styles.actionRow}>
                <Pressable
                  onPress={handleResendOtp}
                  disabled={countdown > 0}
                  accessibilityRole="button"
                  accessibilityLabel="Resend verification code"
                  style={styles.linkButton}
                >
                  <Text
                    style={[styles.linkText, countdown > 0 && { color: Colors.secondaryText }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleResetToEmail}
                  accessibilityRole="button"
                  accessibilityLabel="Change email address"
                  style={styles.linkButton}
                >
                  <Text style={styles.linkText} maxFontSizeMultiplier={1.3}>
                    Change Email
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* SecureStore Hardware Encryption Notice */}
          <View style={styles.securityNote}>
            <ShieldCheck size={16} color={Colors.statusNormal} />
            <Text style={styles.securityText} maxFontSizeMultiplier={1.3}>
              HTTPS Only • Tokens encrypted locally via hardware Keystore (expo-secure-store).
            </Text>
          </View>

          {/* DPDP Consent Shortcut */}
          {onOpenDPDPConsent && (
            <Pressable
              onPress={onOpenDPDPConsent}
              accessibilityRole="button"
              accessibilityLabel="View DPDP 2023 Consent Notice"
              style={styles.dpdpLink}
            >
              <Text style={styles.dpdpLinkText} maxFontSizeMultiplier={1.3}>
                View India DPDP 2023 Consent Notice & Rights
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  topBarTitles: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  topBarCategory: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topBarName: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  closeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.borderLight,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  heroBox: {
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  heroIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.redTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    color: Colors.text,
    fontFamily: Typography.hero.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.cards,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
    fontSize: 15,
  },
  otpInput: {
    fontSize: 20,
    letterSpacing: 4,
    fontWeight: '700',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radii.pills,
    gap: 8,
    ...Shadows.card,
  },
  primaryBtnText: {
    color: Colors.white,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.statusNormalBg,
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: 6,
  },
  statusText: {
    color: Colors.statusNormal,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  linkButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  linkText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  securityText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    textAlign: 'center',
  },
  dpdpLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dpdpLinkText: {
    color: Colors.primary,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
