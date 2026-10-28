// ============================================================================
// src/features/legal/DPDPConsentModal.tsx
//
// India Digital Personal Data Protection Act (DPDP Act 2023) Consent Screen.
// Features:
// - Plain-language Notice before seeking consent (Section 5 DPDP Act)
// - Granular, affirmative, unbundled consent checkboxes (Section 6 DPDP Act)
// - Clear declaration of purpose (Health intelligence & nutrition tracking only)
// - Data Principal rights (Access, Erasure, Grievance Redressal, Withdrawal)
// - Explicit DPO / Grievance Officer contact details
// ============================================================================

import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  CheckSquare,
  Square,
  Lock,
  Trash2,
  Mail,
  X,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { CircleArrowButton } from '@/components/CircleArrowButton';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/utils/haptics';

export interface DPDPConsentModalProps {
  visible: boolean;
  onAccept: (consentData: {
    healthDataConsent: boolean;
    localStorageConsent: boolean;
    notificationsConsent: boolean;
    acceptedAt: string;
  }) => void;
  onClose: () => void;
  onOpenPrivacyPolicy?: () => void;
  isViewOnly?: boolean;
}

export function DPDPConsentModal({
  visible,
  onAccept,
  onClose,
  onOpenPrivacyPolicy,
  isViewOnly = false,
}: DPDPConsentModalProps) {
  const [consentHealthData, setConsentHealthData] = useState<boolean>(!isViewOnly ? false : true);
  const [consentLocalStorage, setConsentLocalStorage] = useState<boolean>(!isViewOnly ? false : true);
  const [consentNotifications, setConsentNotifications] = useState<boolean>(!isViewOnly ? false : true);

  const canProceed = consentHealthData && consentLocalStorage;

  const handleToggleHealthData = async () => {
    if (isViewOnly) return;
    await triggerLightHaptic();
    setConsentHealthData(!consentHealthData);
  };

  const handleToggleLocalStorage = async () => {
    if (isViewOnly) return;
    await triggerLightHaptic();
    setConsentLocalStorage(!consentLocalStorage);
  };

  const handleToggleNotifications = async () => {
    if (isViewOnly) return;
    await triggerLightHaptic();
    setConsentNotifications(!consentNotifications);
  };

  const handleConfirmConsent = async () => {
    if (!canProceed) return;
    await triggerSuccessHaptic();
    onAccept({
      healthDataConsent: consentHealthData,
      localStorageConsent: consentLocalStorage,
      notificationsConsent: consentNotifications,
      acceptedAt: new Date().toISOString(),
    });
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
              LEGAL & PRIVACY COMPLIANCE
            </Text>
            <Text style={styles.topBarName} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              DPDP 2023 Consent Notice
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close consent modal"
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
          {/* Header Banner */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconBox}>
              <ShieldCheck size={26} color={Colors.primary} strokeWidth={2.4} />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle} maxFontSizeMultiplier={1.3}>
                Digital Personal Data Protection Notice
              </Text>
              <Text style={styles.bannerSubtitle} maxFontSizeMultiplier={1.3}>
                Pursuant to Section 5 of the Digital Personal Data Protection Act, 2023 (DPDP Act).
              </Text>
            </View>
          </View>

          {/* Section 1: Notice of Purpose */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader} maxFontSizeMultiplier={1.3}>
              1. Notice of Specified Purpose
            </Text>
            <Text style={styles.bodyText} maxFontSizeMultiplier={1.3}>
              ClinixBridge collects and processes your laboratory blood test values, age, biological sex, dietary style, and declared allergens solely for the following specified purposes:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem} maxFontSizeMultiplier={1.3}>
                • Comparing numerical test results against deterministic clinical reference intervals.
              </Text>
              <Text style={styles.bulletItem} maxFontSizeMultiplier={1.3}>
                • Recommending Indian whole-food nutritional cofactors mapped to flagged biomarkers.
              </Text>
              <Text style={styles.bulletItem} maxFontSizeMultiplier={1.3}>
                • Rendering local historical progress trends with shaded reference limits.
              </Text>
            </View>
            <View style={styles.guaranteeBox}>
              <Text style={styles.guaranteeText} maxFontSizeMultiplier={1.3}>
                🔒 <strong>Our Commitment:</strong> Your health records are NEVER sold, NEVER used for commercial ad targeting, and NEVER used to train external artificial intelligence models.
              </Text>
            </View>
          </View>

          {/* Section 2: Granular Consent Checkboxes */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader} maxFontSizeMultiplier={1.3}>
              2. Granular Affirmative Consent
            </Text>
            <Text style={styles.bodyText} maxFontSizeMultiplier={1.3}>
              Please indicate your explicit consent for each category below:
            </Text>

            {/* Consent Item 1: Health Data (Required) */}
            <Pressable
              onPress={handleToggleHealthData}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: consentHealthData }}
              accessibilityLabel="Consent to processing health and biomarker data"
              style={[styles.consentRow, consentHealthData && styles.consentRowChecked]}
            >
              <View style={styles.checkboxCol}>
                {consentHealthData ? (
                  <CheckSquare size={22} color={Colors.primary} strokeWidth={2.4} />
                ) : (
                  <Square size={22} color={Colors.secondaryText} strokeWidth={2} />
                )}
              </View>
              <View style={styles.consentTextCol}>
                <View style={styles.consentTitleRow}>
                  <Text style={styles.consentTitle} maxFontSizeMultiplier={1.3}>
                    Processing of Blood Marker Data
                  </Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredBadgeText}>REQUIRED</Text>
                  </View>
                </View>
                <Text style={styles.consentDescription} maxFontSizeMultiplier={1.3}>
                  I consent to the deterministic processing of my blood test parameters to receive personalized nutritional suggestions.
                </Text>
              </View>
            </Pressable>

            {/* Consent Item 2: Local Hardware Storage (Required) */}
            <Pressable
              onPress={handleToggleLocalStorage}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: consentLocalStorage }}
              accessibilityLabel="Consent to local hardware storage and SecureStore"
              style={[styles.consentRow, consentLocalStorage && styles.consentRowChecked]}
            >
              <View style={styles.checkboxCol}>
                {consentLocalStorage ? (
                  <CheckSquare size={22} color={Colors.primary} strokeWidth={2.4} />
                ) : (
                  <Square size={22} color={Colors.secondaryText} strokeWidth={2} />
                )}
              </View>
              <View style={styles.consentTextCol}>
                <View style={styles.consentTitleRow}>
                  <Text style={styles.consentTitle} maxFontSizeMultiplier={1.3}>
                    Local Encrypted Storage (SecureStore)
                  </Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredBadgeText}>REQUIRED</Text>
                  </View>
                </View>
                <Text style={styles.consentDescription} maxFontSizeMultiplier={1.3}>
                  I consent to encrypting and persisting my session tokens and clinical reports locally in device SQLite and expo-secure-store.
                </Text>
              </View>
            </Pressable>

            {/* Consent Item 3: Local Notifications (Optional) */}
            <Pressable
              onPress={handleToggleNotifications}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: consentNotifications }}
              accessibilityLabel="Consent to local retest reminders and meal check-ins"
              style={[styles.consentRow, consentNotifications && styles.consentRowChecked]}
            >
              <View style={styles.checkboxCol}>
                {consentNotifications ? (
                  <CheckSquare size={22} color={Colors.statusNormal} strokeWidth={2.4} />
                ) : (
                  <Square size={22} color={Colors.secondaryText} strokeWidth={2} />
                )}
              </View>
              <View style={styles.consentTextCol}>
                <View style={styles.consentTitleRow}>
                  <Text style={styles.consentTitle} maxFontSizeMultiplier={1.3}>
                    Retest Reminders & Meal Alerts
                  </Text>
                  <View style={[styles.requiredBadge, { backgroundColor: Colors.borderLight }]}>
                    <Text style={[styles.requiredBadgeText, { color: Colors.secondaryText }]}>OPTIONAL</Text>
                  </View>
                </View>
                <Text style={styles.consentDescription} maxFontSizeMultiplier={1.3}>
                  I consent to receiving local notifications for 60-day retest alerts and daily 8:00 PM meal check-ins.
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Section 3: Data Principal Rights */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader} maxFontSizeMultiplier={1.3}>
              3. Your Rights under the DPDP Act
            </Text>
            <Text style={styles.bodyText} maxFontSizeMultiplier={1.3}>
              As a Data Principal, you have affirmative statutory rights:
            </Text>
            <View style={styles.rightsGrid}>
              <View style={styles.rightItem}>
                <Text style={styles.rightTitle} maxFontSizeMultiplier={1.3}>Right to Access & Summary</Text>
                <Text style={styles.rightDesc} maxFontSizeMultiplier={1.3}>Export a complete PDF summary of your health data anytime.</Text>
              </View>
              <View style={styles.rightItem}>
                <Text style={styles.rightTitle} maxFontSizeMultiplier={1.3}>Right to Correction & Erasure</Text>
                <Text style={styles.rightDesc} maxFontSizeMultiplier={1.3}>Instantly purge all records using "Delete All My Data".</Text>
              </View>
              <View style={styles.rightItem}>
                <Text style={styles.rightTitle} maxFontSizeMultiplier={1.3}>Right to Withdraw Consent</Text>
                <Text style={styles.rightDesc} maxFontSizeMultiplier={1.3}>Withdraw consent easily from the Profile Settings tab.</Text>
              </View>
              <View style={styles.rightItem}>
                <Text style={styles.rightTitle} maxFontSizeMultiplier={1.3}>Right to Grievance Redressal</Text>
                <Text style={styles.rightDesc} maxFontSizeMultiplier={1.3}>Direct access to our designated Data Protection Officer.</Text>
              </View>
            </View>
          </View>

          {/* Section 4: Grievance Officer & Contact */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader} maxFontSizeMultiplier={1.3}>
              4. Data Protection & Grievance Officer
            </Text>
            <Text style={styles.bodyText} maxFontSizeMultiplier={1.3}>
              For any privacy inquiries or to exercise your rights under the DPDP Act, contact:
            </Text>
            <View style={styles.dpoCard}>
              <Text style={styles.dpoName} maxFontSizeMultiplier={1.3}>Data Protection Officer (DPO)</Text>
              <Text style={styles.dpoDetails} maxFontSizeMultiplier={1.3}>ClinixBridge Health Technologies India Pvt. Ltd.</Text>
              <Text style={styles.dpoDetails} maxFontSizeMultiplier={1.3}>Indiranagar, Bengaluru, Karnataka, 560038, India</Text>
              <Text style={[styles.dpoDetails, { color: Colors.primary, fontWeight: '700', marginTop: 4 }]} maxFontSizeMultiplier={1.3}>
                Email: dpo@clinixbridge.internal
              </Text>
            </View>
          </View>

          {/* Privacy Policy Link */}
          {onOpenPrivacyPolicy && (
            <Pressable
              onPress={onOpenPrivacyPolicy}
              accessibilityRole="button"
              accessibilityLabel="Read Full Privacy Policy"
              style={styles.policyLinkRow}
            >
              <FileText size={16} color={Colors.deepMaroon} />
              <Text style={styles.policyLinkText} maxFontSizeMultiplier={1.3}>
                Read Full ClinixBridge Privacy Policy
              </Text>
              <ArrowRight size={14} color={Colors.deepMaroon} />
            </Pressable>
          )}

          {/* Medical Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <MedicalDisclaimer />
          </View>

          {/* Action Button */}
          {!isViewOnly ? (
            <Pressable
              onPress={handleConfirmConsent}
              disabled={!canProceed}
              accessibilityRole="button"
              accessibilityLabel="Accept terms and confirm consent"
              android_ripple={{ color: Colors.rippleLight, borderless: false }}
              style={[styles.acceptButton, !canProceed && styles.acceptButtonDisabled]}
            >
              <Text style={styles.acceptButtonText} maxFontSizeMultiplier={1.3}>
                Accept & Confirm Consent
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close consent modal"
              style={styles.acceptButton}
            >
              <Text style={styles.acceptButtonText} maxFontSizeMultiplier={1.3}>
                Done
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
    paddingBottom: Spacing.huge * 1.5,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radii.cards,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  bannerIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.redTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 16,
    fontWeight: '800',
  },
  bannerSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.cards,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  sectionHeader: {
    color: Colors.deepMaroon,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  bodyText: {
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  bulletList: {
    paddingLeft: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  bulletItem: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  guaranteeBox: {
    backgroundColor: Colors.redTint,
    borderRadius: 8,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  guaranteeText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  consentRowChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  checkboxCol: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  consentTextCol: {
    flex: 1,
  },
  consentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  consentTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: Colors.redTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pills,
    marginLeft: 6,
  },
  requiredBadgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  consentDescription: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
  },
  rightsGrid: {
    gap: Spacing.sm,
  },
  rightItem: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.sm,
  },
  rightTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  rightDesc: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 1,
  },
  dpoCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
  },
  dpoName: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  dpoDetails: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  policyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  policyLinkText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  disclaimerContainer: {
    marginBottom: Spacing.lg,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radii.pills,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  acceptButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  acceptButtonText: {
    color: Colors.white,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
});
