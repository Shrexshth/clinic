import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  User,
  Heart,
  Scale,
  Ruler,
  Sparkles,
} from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { AppCard } from '@/components/AppCard';
import { PillChip } from '@/components/PillChip';
import { CircleArrowButton } from '@/components/CircleArrowButton';
import { SectionHeader } from '@/components/SectionHeader';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { useAppStore } from '@/store/useAppStore';
import { DPDPConsentModal } from '@/features/legal/DPDPConsentModal';
import { PrivacyPolicyModal } from '@/features/legal/PrivacyPolicyModal';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/utils/haptics';

export interface OnboardingScreenProps {
  onBackToWelcome?: () => void;
}

export function OnboardingScreen({ onBackToWelcome }: OnboardingScreenProps) {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  // Current Step: 1 (Demographics) -> 2 (Diet & Allergies) -> 3 (Goal & Consent)
  const [step, setStep] = useState<number>(1);
  const [isDPDPVisible, setIsDPDPVisible] = useState<boolean>(false);
  const [isPrivacyVisible, setIsPrivacyVisible] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>('Alex Rivera');
  const [age, setAge] = useState<string>('30');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState<string>('178 cm');
  const [weight, setWeight] = useState<string>('72 kg');
  const [dietType, setDietType] = useState<'veg' | 'non-veg' | 'vegan'>('non-veg');
  const [allergies, setAllergies] = useState<string[]>(['Gluten-sensitive', 'Shellfish']);
  const [goal, setGoal] = useState<string>('Rebuild Iron & Vitality');
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);

  const availableAllergies = [
    'Gluten-sensitive',
    'Dairy / Lactose',
    'Shellfish',
    'Peanuts',
    'Tree Nuts',
    'Soy',
    'Eggs',
    'None',
  ];

  const availableGoals = [
    'Rebuild Iron & Vitality',
    'Stabilize Blood Sugar',
    'Elevate Vitamin D3',
    'Cardiovascular Heart Health',
    'Longevity & Energy',
  ];

  const toggleAllergy = (item: string) => {
    if (item === 'None') {
      setAllergies(['None']);
      return;
    }
    const filtered = allergies.filter((a) => a !== 'None');
    if (filtered.includes(item)) {
      setAllergies(filtered.filter((a) => a !== item));
    } else {
      setAllergies([...filtered, item]);
    }
  };

  const handleFinish = async () => {
    if (!consentAccepted) return;

    await completeOnboarding({
      name: name.trim() || 'Alex Rivera',
      age: parseInt(age, 10) || 30,
      sex,
      height: height.trim() || '178 cm',
      weight: weight.trim() || '72 kg',
      dietType,
      allergies,
      goals: [goal],
      email: 'alex.rivera@clinixbridge.internal',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.stepProgressRow}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.stepSegment,
                  s <= step ? styles.stepSegmentActive : styles.stepSegmentInactive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepIndicatorText}>Step {step} of 3</Text>
        </View>

        {/* STEP 1: Demographics (Age, Sex, Height, Weight) */}
        {step === 1 && (
          <View>
            <SectionHeader
              text="Personal"
              highlightWord="Demographics"
              subtitle="Calibrates biomarker reference ranges and metabolic targets"
            />

            <AppCard padding="lg" style={styles.formCard}>
              {/* Full Name */}
              <Text style={styles.fieldLabel}>Your Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor={Colors.secondaryText}
                style={styles.textInput}
              />

              {/* Age */}
              <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Age (years)</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="e.g. 30"
                placeholderTextColor={Colors.secondaryText}
                style={styles.textInput}
              />

              {/* Biological Sex */}
              <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Biological Sex</Text>
              <View style={styles.pillRow}>
                {(['male', 'female', 'other'] as const).map((s) => (
                  <PillChip
                    key={s}
                    label={s.charAt(0).toUpperCase() + s.slice(1)}
                    selected={sex === s}
                    onPress={() => setSex(s)}
                    style={styles.optionChip}
                  />
                ))}
              </View>

              {/* Height & Weight Row */}
              <View style={[styles.twoColRow, { marginTop: Spacing.md }]}>
                <View style={styles.colHalf}>
                  <Text style={styles.fieldLabel}>Height</Text>
                  <View style={styles.inputWithIcon}>
                    <Ruler size={16} color={Colors.secondaryText} />
                    <TextInput
                      value={height}
                      onChangeText={setHeight}
                      placeholder="e.g. 178 cm"
                      placeholderTextColor={Colors.secondaryText}
                      style={styles.iconInput}
                    />
                  </View>
                </View>

                <View style={styles.colHalf}>
                  <Text style={styles.fieldLabel}>Weight</Text>
                  <View style={styles.inputWithIcon}>
                    <Scale size={16} color={Colors.secondaryText} />
                    <TextInput
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="e.g. 72 kg"
                      placeholderTextColor={Colors.secondaryText}
                      style={styles.iconInput}
                    />
                  </View>
                </View>
              </View>
            </AppCard>

            <Pressable
              onPress={() => setStep(2)}
              android_ripple={{ color: Colors.rippleLight, borderless: false }}
              style={styles.primaryActionButton}
            >
              <Text style={styles.primaryActionText}>Continue to Diet & Allergies</Text>
              <ArrowRight size={18} color={Colors.white} strokeWidth={2.4} style={{ marginLeft: Spacing.sm }} />
            </Pressable>
          </View>
        )}

        {/* STEP 2: Diet Type (veg, non-veg, vegan) & Allergies (multi-select chips) */}
        {step === 2 && (
          <View>
            <SectionHeader
              text="Diet &"
              highlightWord="Allergies"
              subtitle="Filters recipes and prioritizes safe micronutrient sources"
            />

            {/* Diet Type: veg, non-veg, vegan */}
            <AppCard padding="lg" style={styles.formCard}>
              <Text style={styles.fieldLabel}>Select Diet Type</Text>
              <View style={styles.pillRow}>
                {[
                  { id: 'veg' as const, label: 'Vegetarian (Veg)' },
                  { id: 'non-veg' as const, label: 'Omnivore (Non-Veg)' },
                  { id: 'vegan' as const, label: 'Plant-Based (Vegan)' },
                ].map((d) => (
                  <PillChip
                    key={d.id}
                    label={d.label}
                    selected={dietType === d.id}
                    onPress={() => setDietType(d.id)}
                    style={styles.optionChip}
                  />
                ))}
              </View>

              {/* Allergies (Multi-Select Chips) */}
              <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>
                Known Allergies / Sensitivities (Multi-Select)
              </Text>
              <View style={styles.chipsWrap}>
                {availableAllergies.map((allergy) => {
                  const isSelected = allergies.includes(allergy);
                  return (
                    <PillChip
                      key={allergy}
                      label={allergy}
                      selected={isSelected}
                      onPress={() => toggleAllergy(allergy)}
                    />
                  );
                })}
              </View>
            </AppCard>

            <View style={styles.navButtonsRow}>
              <Pressable
                onPress={() => setStep(1)}
                android_ripple={{ color: Colors.ripple, borderless: false }}
                style={styles.secondaryNavButton}
              >
                <ArrowLeft size={16} color={Colors.text} />
                <Text style={styles.secondaryNavText}>Back</Text>
              </Pressable>

              <Pressable
                onPress={() => setStep(3)}
                android_ripple={{ color: Colors.rippleLight, borderless: false }}
                style={[styles.primaryActionButton, { flex: 1, marginLeft: Spacing.md }]}
              >
                <Text style={styles.primaryActionText}>Continue to Goals & Consent</Text>
                <ArrowRight size={18} color={Colors.white} strokeWidth={2.4} style={{ marginLeft: Spacing.sm }} />
              </Pressable>
            </View>
          </View>
        )}

        {/* STEP 3: Primary Goal & Consent / Disclaimer Screen */}
        {step === 3 && (
          <View>
            <SectionHeader
              text="Goals &"
              highlightWord="Consent"
              subtitle="Select your primary health goal and accept clinical guidelines"
            />

            {/* Goal Selection */}
            <AppCard padding="lg" style={styles.formCard}>
              <Text style={styles.fieldLabel}>Primary Health Focus</Text>
              <View style={styles.chipsWrap}>
                {availableGoals.map((g) => (
                  <PillChip
                    key={g}
                    label={g}
                    selected={goal === g}
                    onPress={() => setGoal(g)}
                  />
                ))}
              </View>
            </AppCard>

            {/* Mandatory Consent & Medical Disclaimer Card */}
            <AppCard padding="lg" style={[styles.formCard, styles.consentCard]}>
              <View style={styles.consentHeader}>
                <ShieldCheck size={22} color={Colors.primary} strokeWidth={2.4} />
                <Text style={styles.consentTitle}>Consent & Clinical Disclaimer</Text>
              </View>

              <Text style={styles.disclaimerQuote}>
                &quot;Informational only, not medical advice.&quot;
              </Text>

              <Text style={styles.consentBody}>
                ClinixBridge utilizes deterministic laboratory reference intervals to assist in dietary education. It does not provide medical diagnosis, pharmacology prescriptions, or clinical treatments. Always consult your physician before initiating supplementation.
              </Text>

              {/* Consent Acceptance Checkbox */}
              <Pressable
                onPress={() => {
                  triggerLightHaptic();
                  setConsentAccepted(!consentAccepted);
                }}
                accessibilityRole="checkbox"
                accessibilityLabel="I acknowledge and accept that ClinixBridge provides educational nutritional insights only and is not medical advice."
                accessibilityState={{ checked: consentAccepted }}
                android_ripple={{ color: Colors.ripple, borderless: false }}
                style={styles.checkboxRow}
              >
                <View style={[styles.checkboxBox, consentAccepted && styles.checkboxBoxActive]}>
                  {consentAccepted && <Check size={14} color={Colors.white} strokeWidth={3} />}
                </View>
                <Text maxFontSizeMultiplier={1.4} style={styles.checkboxLabel}>
                  I acknowledge and accept that ClinixBridge provides educational nutritional insights only and is not medical advice.
                </Text>
              </Pressable>

              {/* DPDP and Privacy Policy Direct Links */}
              <View style={styles.legalLinksRow}>
                <Pressable
                  onPress={() => {
                    triggerLightHaptic();
                    setIsDPDPVisible(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="View statutory DPDP 2023 Consent Notice"
                >
                  <Text maxFontSizeMultiplier={1.4} style={styles.legalLinkText}>
                    DPDP 2023 Notice
                  </Text>
                </Pressable>
                <Text style={styles.legalLinkDivider}>•</Text>
                <Pressable
                  onPress={() => {
                    triggerLightHaptic();
                    setIsPrivacyVisible(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Read Privacy Policy"
                >
                  <Text maxFontSizeMultiplier={1.4} style={styles.legalLinkText}>
                    Privacy Policy
                  </Text>
                </Pressable>
              </View>
            </AppCard>

            {/* Finish Action */}
            <View style={styles.navButtonsRow}>
              <Pressable
                onPress={() => {
                  triggerLightHaptic();
                  setStep(2);
                }}
                accessibilityRole="button"
                accessibilityLabel="Back to step 2"
                android_ripple={{ color: Colors.ripple, borderless: false }}
                style={styles.secondaryNavButton}
              >
                <ArrowLeft size={16} color={Colors.text} />
                <Text maxFontSizeMultiplier={1.4} style={styles.secondaryNavText}>Back</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  triggerSuccessHaptic();
                  handleFinish();
                }}
                disabled={!consentAccepted}
                accessibilityRole="button"
                accessibilityLabel="Complete onboarding and enter application"
                android_ripple={{ color: Colors.rippleLight, borderless: false }}
                style={[
                  styles.primaryActionButton,
                  { flex: 1, marginLeft: Spacing.md },
                  !consentAccepted && styles.buttonDisabled,
                ]}
              >
                <Text maxFontSizeMultiplier={1.4} style={styles.primaryActionText}>Complete & Enter</Text>
                <ArrowRight size={18} color={Colors.white} strokeWidth={2.4} style={{ marginLeft: Spacing.sm }} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Global Medical Disclaimer Banner */}
        <View style={styles.disclaimerContainer}>
          <MedicalDisclaimer />
        </View>
      </ScrollView>

      {/* Statutory DPDP 2023 Consent Modal */}
      <DPDPConsentModal
        visible={isDPDPVisible}
        onClose={() => setIsDPDPVisible(false)}
        onAccept={() => {
          setIsDPDPVisible(false);
          setConsentAccepted(true);
        }}
        onOpenPrivacyPolicy={() => {
          setIsDPDPVisible(false);
          setIsPrivacyVisible(true);
        }}
        isViewOnly={true}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={isPrivacyVisible}
        onClose={() => setIsPrivacyVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge,
  },
  topBar: {
    marginBottom: Spacing.lg,
  },
  stepProgressRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  stepSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepSegmentActive: {
    backgroundColor: Colors.primary,
  },
  stepSegmentInactive: {
    backgroundColor: Colors.borderLight,
  },
  stepIndicatorText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    lineHeight: Typography.smallBold.lineHeight,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  colHalf: {
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
  },
  iconInput: {
    flex: 1,
    marginLeft: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    marginBottom: Spacing.xs,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radii.pills,
    paddingHorizontal: Spacing.xl,
    ...Shadows.soft,
  },
  primaryActionText: {
    color: Colors.white,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 52,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.pills,
  },
  secondaryNavText: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  consentCard: {
    backgroundColor: Colors.redTint,
    borderColor: Colors.primary,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  consentTitle: {
    color: Colors.deepMaroon,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  disclaimerQuote: {
    color: Colors.primary,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '700',
    marginVertical: Spacing.xs,
  },
  consentBody: {
    color: Colors.deepMaroon,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.small.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(110, 11, 20, 0.15)',
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.deepMaroon,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxBoxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    fontWeight: '600',
  },
  disclaimerContainer: {
    marginTop: Spacing.xl,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  legalLinkText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  legalLinkDivider: {
    color: Colors.secondaryText,
    marginHorizontal: Spacing.sm,
  },
});
