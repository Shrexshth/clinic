// ============================================================================
// src/features/legal/PrivacyPolicyModal.tsx
//
// ClinixBridge Comprehensive Privacy Policy Document.
// Fully compliant with India Digital Personal Data Protection Act, 2023.
// ============================================================================

import React from 'react';
import {
  Modal,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Lock, X, CheckCircle2 } from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { CircleArrowButton } from '@/components/CircleArrowButton';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';

export interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
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
              LEGAL DOCUMENT
            </Text>
            <Text style={styles.topBarName} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              ClinixBridge Privacy Policy
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close privacy policy"
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
          {/* Version Header */}
          <View style={styles.versionCard}>
            <Shield size={24} color={Colors.primary} />
            <View style={styles.versionTextCol}>
              <Text style={styles.versionTitle} maxFontSizeMultiplier={1.3}>
                Privacy Policy (DPDP 2023 Compliant)
              </Text>
              <Text style={styles.versionDate} maxFontSizeMultiplier={1.3}>
                Effective Date: October 2026 • Version 2.0
              </Text>
            </View>
          </View>

          {/* Section 1 */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
              1. Introduction & Core Philosophy
            </Text>
            <Text style={styles.paragraph} maxFontSizeMultiplier={1.3}>
              ClinixBridge is committed to safeguarding the privacy and digital autonomy of our users. We adopt a local-first engineering philosophy: your laboratory results, biomarker evaluations, and personal nutrition records reside directly on your physical device, protected by device-level encryption.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
              2. Categories of Personal Data Collected
            </Text>
            <Text style={styles.paragraph} maxFontSizeMultiplier={1.3}>
              We process personal data solely necessary for delivering personalized nutrition intelligence:
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>Biomarker Laboratory Data:</strong> Measured values, units, reference intervals, and test dates extracted from uploaded blood reports.
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>Demographic & Lifestyle Profile:</strong> Age band, biological sex, height, weight, dietary style (veg, non-veg, vegan), and declared food allergies.
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>Contact Data:</strong> Email address for authentication via one-time passwords (OTP).
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
              3. Purpose of Processing
            </Text>
            <Text style={styles.paragraph} maxFontSizeMultiplier={1.3}>
              Data is processed exclusively to:
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              1. Deterministically categorize blood parameters against clinical reference rules.
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              2. Generate 7-day Indian meal plans containing whole-food cofactors mapped to flagged markers.
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              3. Verify that zero declared allergens are present in recommended meals or grocery lists.
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              4. Render visual trajectory trends (improved / worsened / stable) over historical tests.
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
              4. Security Architecture & HTTPS Only
            </Text>
            <Text style={styles.paragraph} maxFontSizeMultiplier={1.3}>
              • <strong>Local-First SQLite:</strong> Blood records are stored in a dedicated SQLite database on your device.
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>Hardware Token Storage:</strong> Authentication tokens are stored in hardware-backed secure enclaves via <code>expo-secure-store</code> (Android Keystore / iOS Keychain).
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>HTTPS Only Transmission:</strong> Any network communication with Supabase Edge Functions strictly enforces TLS 1.3 / HTTPS encryption. Plain HTTP is programmatically blocked.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
              5. Artificial Intelligence & Third Parties
            </Text>
            <Text style={styles.paragraph} maxFontSizeMultiplier={1.3}>
              • <strong>Zero Commercial Advertising:</strong> We do not sell, rent, or monetize your personal data.
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>Zero AI Model Training:</strong> Prompt data sent to Google Gemini Flash API operates under enterprise zero-data-retention terms and is never used to train machine learning models.
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>Deterministic Safety:</strong> Critical clinical range evaluations and allergen filtering are performed via deterministic rules code, never left to LLM prediction.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
              6. Data Principal Rights under India DPDP Act 2023
            </Text>
            <Text style={styles.paragraph} maxFontSizeMultiplier={1.3}>
              Under the Digital Personal Data Protection Act, 2023, you hold the following rights:
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>Right to Access:</strong> View and export your health data via PDF summary anytime.
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>Right to Correction & Erasure:</strong> Purge all records permanently via "Delete All My Data".
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>Right to Grievance Redressal:</strong> Direct escalation to our Data Protection Officer.
            </Text>
            <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>
              • <strong>Right to Nominate:</strong> Nominate an individual in the event of death or incapacity.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
              7. Grievance Officer & Contact Information
            </Text>
            <Text style={styles.paragraph} maxFontSizeMultiplier={1.3}>
              In accordance with DPDP Act, 2023, questions or grievances may be addressed to:
            </Text>
            <View style={styles.officerBox}>
              <Text style={styles.officerTitle} maxFontSizeMultiplier={1.3}>Data Protection Officer (DPO)</Text>
              <Text style={styles.officerText} maxFontSizeMultiplier={1.3}>ClinixBridge Health Technologies India Pvt. Ltd.</Text>
              <Text style={styles.officerText} maxFontSizeMultiplier={1.3}>Indiranagar, Bengaluru, Karnataka, 560038, India</Text>
              <Text style={[styles.officerText, { color: Colors.primary, fontWeight: '700', marginTop: 4 }]} maxFontSizeMultiplier={1.3}>
                Email: dpo@clinixbridge.internal
              </Text>
            </View>
          </View>

          {/* Medical Disclaimer */}
          <View style={styles.disclaimerWrapper}>
            <MedicalDisclaimer />
          </View>

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close privacy policy"
            android_ripple={{ color: Colors.rippleLight, borderless: false }}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText} maxFontSizeMultiplier={1.3}>
              I Understand
            </Text>
          </Pressable>
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
  versionCard: {
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
  versionTextCol: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  versionTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  versionDate: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
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
  sectionTitle: {
    color: Colors.deepMaroon,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  paragraph: {
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.xs,
  },
  bullet: {
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
    paddingLeft: Spacing.xs,
  },
  officerBox: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  officerTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  officerText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  disclaimerWrapper: {
    marginBottom: Spacing.lg,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radii.pills,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  doneBtnText: {
    color: Colors.white,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
});
