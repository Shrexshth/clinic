import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {
  User,
  Database,
  Trash2,
  Lock,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  RefreshCw,
  Ruler,
  Scale,
  Bell,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Mail,
  LogOut,
  FileCheck2,
} from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { AppCard } from '@/components/AppCard';
import { PillChip } from '@/components/PillChip';
import { SectionHeader } from '@/components/SectionHeader';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { useAppStore } from '@/store/useAppStore';
import {
  scheduleRetestReminder,
  scheduleDailyMealCheckIn,
  cancelRetestReminders,
  cancelDailyMealCheckIn,
  triggerTestNotification,
} from '@/services/notifications';
import { exportReportSummaryAsPdf } from '@/services/pdfExport';
import { getAuthSession, signOutUser } from '@/services/supabase';
import { AuthModal } from '@/features/auth/AuthModal';
import { DPDPConsentModal } from '@/features/legal/DPDPConsentModal';
import { PrivacyPolicyModal } from '@/features/legal/PrivacyPolicyModal';
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
} from '@/utils/haptics';

export interface ProfileViewProps {
  onShowWelcome: () => void;
  onOpenGallery: () => void;
}

export function ProfileView({ onShowWelcome, onOpenGallery }: ProfileViewProps) {
  const {
    userProfile,
    activeReport,
    flaggedBiomarkers,
    foodRecommendations,
    loadDemoData,
    updateProfile,
    deleteUserData,
  } = useAppStore();

  const [diet, setDiet] = useState<string>(userProfile?.dietType || 'non-veg');
  const [allergies, setAllergies] = useState<string[]>(userProfile?.allergies || ['Gluten-sensitive', 'Shellfish']);
  const [goals, setGoals] = useState<string[]>(userProfile?.goals || ['Rebuild Iron & Vitality']);
  const [retestRemindersEnabled, setRetestRemindersEnabled] = useState<boolean>(true);
  const [mealCheckInEnabled, setMealCheckInEnabled] = useState<boolean>(true);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Supabase Auth and Legal Modals State
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState<boolean>(false);
  const [isDPDPConsentVisible, setIsDPDPConsentVisible] = useState<boolean>(false);
  const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState<boolean>(false);

  // Check existing Supabase session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getAuthSession();
        if (session?.user?.email) {
          setAuthEmail(session.user.email);
        }
      } catch (err) {
        console.warn('Failed to read auth session:', err);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setDiet(userProfile.dietType);
      setAllergies(userProfile.allergies);
      setGoals(userProfile.goals);
    }
  }, [userProfile]);

  const diets = [
    { id: 'veg', label: 'Vegetarian (Veg)' },
    { id: 'non-veg', label: 'Omnivore (Non-Veg)' },
    { id: 'vegan', label: 'Plant-Based (Vegan)' },
  ];

  const availableAllergies = [
    'Gluten-sensitive',
    'Shellfish',
    'Dairy / Lactose',
    'Peanuts',
    'Tree Nuts',
    'Soy',
    'Eggs',
  ];

  const availableGoals = [
    'Rebuild Iron & Vitality',
    'Stabilize Blood Sugar',
    'Elevate Vitamin D3',
    'Cardiovascular Heart Health',
    'Longevity & Energy',
  ];

  const handleSignOut = async () => {
    triggerMediumHaptic();
    await signOutUser();
    setAuthEmail(null);
    Alert.alert('Signed Out', 'Your session tokens have been removed from expo-secure-store.');
  };

  const handleOpenAuth = () => {
    triggerLightHaptic();
    setIsAuthModalVisible(true);
  };

  const handleOpenDPDP = () => {
    triggerLightHaptic();
    setIsDPDPConsentVisible(true);
  };

  const handleOpenPrivacy = () => {
    triggerLightHaptic();
    setIsPrivacyModalVisible(true);
  };

  const toggleAllergy = async (allergy: string) => {
    triggerLightHaptic();
    let next: string[];
    if (allergies.includes(allergy)) {
      next = allergies.filter((a) => a !== allergy);
    } else {
      next = [...allergies, allergy];
    }
    setAllergies(next);
    await updateProfile({ allergies: next });
  };

  const toggleGoal = async (g: string) => {
    triggerLightHaptic();
    let next: string[];
    if (goals.includes(g)) {
      next = goals.filter((item) => item !== g);
    } else {
      next = [...goals, g];
    }
    setGoals(next);
    await updateProfile({ goals: next });
  };

  const handleDietSelect = async (d: string) => {
    triggerLightHaptic();
    setDiet(d);
    await updateProfile({ dietType: d });
  };

  const handleLoadDemoData = async () => {
    triggerMediumHaptic();
    await loadDemoData();
    triggerSuccessHaptic();
    Alert.alert(
      'Demo Data Seeded',
      'Realistic blood report (14 normal, 3 borderline, 1 low), historical trends, and 7-day meal plans have been seeded into SQLite.'
    );
  };

  const handleToggleRetestReminders = async (val: boolean) => {
    triggerLightHaptic();
    setRetestRemindersEnabled(val);
    if (val) {
      if (flaggedBiomarkers && flaggedBiomarkers.length > 0) {
        for (const marker of flaggedBiomarkers) {
          await scheduleRetestReminder(marker.name, 60);
        }
      } else {
        await scheduleRetestReminder('Lipid & Iron Panel', 60);
      }
      triggerSuccessHaptic();
      Alert.alert(
        'Reminders Scheduled',
        'Local notification set for 60 days to schedule your repeat laboratory panel.'
      );
    } else {
      await cancelRetestReminders();
    }
  };

  const handleToggleMealCheckIn = async (val: boolean) => {
    triggerLightHaptic();
    setMealCheckInEnabled(val);
    if (val) {
      await scheduleDailyMealCheckIn(20, 0); // 8:00 PM
      triggerSuccessHaptic();
      Alert.alert(
        'Daily Check-In Active',
        'You will receive a daily notification at 8:00 PM to review and mark your meals.'
      );
    } else {
      await cancelDailyMealCheckIn();
    }
  };

  const handleTestNotification = async () => {
    triggerLightHaptic();
    const id = await triggerTestNotification(
      '🩸 ClinixBridge Test Notification',
      'Local notifications are active! Retest reminders and daily check-ins are ready.'
    );
    if (id) {
      triggerSuccessHaptic();
      Alert.alert('Notification Dispatched', 'Check your device notification banner.');
    }
  };

  const handleExportPdf = async () => {
    triggerMediumHaptic();
    if (!activeReport) {
      triggerErrorHaptic();
      Alert.alert('No Report Available', 'Please load demo data or upload a laboratory report first.');
      return;
    }
    try {
      setIsExportingPdf(true);
      const res = await exportReportSummaryAsPdf({
        report: activeReport,
        profile: userProfile,
        foodRecommendations,
      });
      if (!res.success && res.error) {
        triggerErrorHaptic();
        Alert.alert('PDF Export Error', res.error);
      } else {
        triggerSuccessHaptic();
      }
    } catch (err: any) {
      triggerErrorHaptic();
      Alert.alert('Export Error', err?.message || 'Could not export report summary.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDeleteAllData = () => {
    triggerMediumHaptic();
    Alert.alert(
      'Delete All My Data',
      'Are you sure you want to permanently delete all stored blood reports, nutrition logs, scheduled notification alarms, and personal profile records? This action completely wipes all SQLite data and initiates account deletion.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            triggerErrorHaptic();
            await deleteUserData();
            Alert.alert(
              'Account & Data Purged',
              'All personal health data and database records have been deleted.',
              [{ text: 'OK', onPress: () => onShowWelcome() }]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>USER SETTINGS</Text>
          <Text style={styles.headerTitle}>
            Profile & <Text style={{ color: Colors.primary }}>Preferences</Text>
          </Text>
        </View>
      </View>

      {/* User Information Card */}
      <AppCard padding="lg" style={styles.userCard}>
        <View style={styles.userRow}>
          <View style={styles.avatarBox}>
            <User size={24} color={Colors.white} />
          </View>
          <View style={styles.userInfoCol}>
            <Text style={styles.userName}>{userProfile?.name || 'Alex Rivera'}</Text>
            <Text style={styles.userMeta}>
              Age: {userProfile?.age || 30} • Sex: {userProfile?.sex || 'male'}
            </Text>
            <View style={styles.bodyMetricsRow}>
              <View style={styles.metricBadge}>
                <Ruler size={12} color={Colors.deepMaroon} />
                <Text style={styles.metricText}>{userProfile?.height || '178 cm'}</Text>
              </View>
              <View style={[styles.metricBadge, { marginLeft: Spacing.xs }]}>
                <Scale size={12} color={Colors.deepMaroon} />
                <Text style={styles.metricText}>{userProfile?.weight || '72 kg'}</Text>
              </View>
            </View>
          </View>
        </View>
      </AppCard>

      {/* 1. Diet Type Selector */}
      <View style={styles.sectionContainer}>
        <SectionHeader
          text="Dietary"
          highlightWord="Lifestyle"
          subtitle="Stored in SQLite user_profile table"
        />

        <AppCard padding="md">
          {diets.map((d) => {
            const isSelected = diet === d.id;
            return (
              <Pressable
                key={d.id}
                onPress={() => handleDietSelect(d.id)}
                android_ripple={{ color: Colors.ripple, borderless: false }}
                style={styles.dietOptionRow}
              >
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.dietOptionText, isSelected && styles.dietOptionTextActive]}>
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </AppCard>
      </View>

      {/* 2. Allergies & Sensitivities */}
      <View style={styles.sectionContainer}>
        <SectionHeader
          text="Allergies &"
          highlightWord="Sensitivities"
          subtitle="Multi-select chips persisted in SQLite"
        />

        <AppCard padding="lg">
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
      </View>

      {/* 3. Primary Health Goals */}
      <View style={styles.sectionContainer}>
        <SectionHeader
          text="Primary"
          highlightWord="Health Goals"
          subtitle="Tailors nutritional priority algorithms"
        />

        <AppCard padding="lg">
          <View style={styles.chipsWrap}>
            {availableGoals.map((g) => {
              const isSelected = goals.includes(g);
              return (
                <PillChip
                  key={g}
                  label={g}
                  selected={isSelected}
                  onPress={() => toggleGoal(g)}
                />
              );
            })}
          </View>
        </AppCard>
      </View>

      {/* 4. Local Reminders & Notifications Section */}
      <View style={styles.sectionContainer}>
        <SectionHeader
          text="Local"
          highlightWord="Reminders"
          subtitle="Notification alerts managed with expo-notifications"
        />

        <AppCard padding="md">
          {/* Retest Reminders */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleIconCol}>
              <View style={[styles.toggleIconBadge, { backgroundColor: Colors.redTint }]}>
                <Bell size={18} color={Colors.primary} />
              </View>
            </View>
            <View style={styles.toggleDetails}>
              <Text style={styles.toggleTitle}>Retest Reminders (60 Days)</Text>
              <Text style={styles.toggleSubtitle}>
                Alerts to recheck flagged biomarkers and monitor nutrition response
              </Text>
            </View>
            <Switch
              value={retestRemindersEnabled}
              onValueChange={handleToggleRetestReminders}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.menuDivider} />

          {/* Daily Meal Check-in */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleIconCol}>
              <View style={[styles.toggleIconBadge, { backgroundColor: Colors.statusNormalBg }]}>
                <Clock size={18} color={Colors.statusNormal} />
              </View>
            </View>
            <View style={styles.toggleDetails}>
              <Text style={styles.toggleTitle}>Daily Meal Check-In (8:00 PM)</Text>
              <Text style={styles.toggleSubtitle}>
                Evening reminder to mark eaten meals and preview tomorrow’s plan
              </Text>
            </View>
            <Switch
              value={mealCheckInEnabled}
              onValueChange={handleToggleMealCheckIn}
              trackColor={{ false: Colors.border, true: Colors.statusNormal }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.menuDivider} />

          {/* Test Notification Trigger */}
          <Pressable
            onPress={handleTestNotification}
            android_ripple={{ color: Colors.ripple, borderless: false }}
            style={styles.testNotifBtn}
          >
            <Sparkles size={15} color={Colors.deepMaroon} />
            <Text style={styles.testNotifBtnText}>Dispatch Test Notification</Text>
          </Pressable>
        </AppCard>
      </View>

      {/* 5. Report Documents & PDF Export */}
      <View style={styles.sectionContainer}>
        <SectionHeader
          text="Report"
          highlightWord="Documents"
          subtitle="Generate branded clinical summary with expo-print & expo-sharing"
        />

        <AppCard padding="lg" style={styles.exportCard}>
          <View style={styles.exportHeader}>
            <View style={styles.exportIconBox}>
              <FileText size={22} color={Colors.primary} strokeWidth={2.4} />
            </View>
            <View style={styles.exportTextCol}>
              <Text style={styles.exportTitle}>Export Report Summary as PDF</Text>
              <Text style={styles.exportSubtitle}>
                Formatted clinical overview with flagged markers, reference ranges, and tailored Indian diet suggestions.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleExportPdf}
            disabled={isExportingPdf}
            android_ripple={{ color: Colors.rippleLight, borderless: false }}
            style={styles.exportPdfButton}
          >
            {isExportingPdf ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <FileText size={16} color={Colors.white} strokeWidth={2.4} />
                <Text style={styles.exportPdfButtonText}>Generate & Share PDF</Text>
              </>
            )}
          </Pressable>
        </AppCard>
      </View>

      {/* 6. Debug Section: "Load demo data" button */}
      <View style={styles.sectionContainer}>
        <SectionHeader
          text="Debug &"
          highlightWord="Demo Tools"
          subtitle="Seed realistic reports and meal plans into SQLite"
        />

        <AppCard padding="lg" style={styles.debugCard}>
          <View style={styles.debugHeader}>
            <View style={styles.debugIconBox}>
              <Database size={20} color={Colors.primary} />
            </View>
            <View style={styles.debugTextCol}>
              <Text style={styles.debugTitle}>SQLite Database Seeder</Text>
              <Text style={styles.debugSubtitle}>
                Populates user_profile, reports, biomarker_results, meal_plans, and meal_items tables.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleLoadDemoData}
            android_ripple={{ color: Colors.rippleLight, borderless: false }}
            style={styles.loadDemoButton}
          >
            <RefreshCw size={16} color={Colors.white} strokeWidth={2.4} />
            <Text style={styles.loadDemoButtonText}>Load demo data</Text>
          </Pressable>
        </AppCard>
      </View>

      {/* 7. Navigation Shortcuts: Welcome Screen & Gallery */}
      <View style={styles.sectionContainer}>
        <SectionHeader
          text="App"
          highlightWord="Navigation"
          subtitle="Explore brand intro and component gallery"
        />

        <AppCard padding="sm">
          <Pressable
            onPress={onShowWelcome}
            android_ripple={{ color: Colors.ripple, borderless: false }}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <Sparkles size={18} color={Colors.deepMaroon} />
              <Text style={styles.menuText}>View Welcome Introduction</Text>
            </View>
            <ChevronRight size={18} color={Colors.secondaryText} />
          </Pressable>

          <View style={styles.menuDivider} />

          <Pressable
            onPress={onOpenGallery}
            android_ripple={{ color: Colors.ripple, borderless: false }}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <LayoutGrid size={18} color={Colors.deepMaroon} />
              <Text style={styles.menuText}>Component Design Gallery</Text>
            </View>
            <ChevronRight size={18} color={Colors.secondaryText} />
          </Pressable>
        </AppCard>
      </View>

      {/* 8. Supabase Auth & Cloud Sync (HTTPS + expo-secure-store) */}
      <View style={styles.sectionContainer}>
        <SectionHeader
          text="Account &"
          highlightWord="Cloud Auth"
          subtitle="Supabase Auth with Email OTP & hardware KeyStore"
        />

        <AppCard padding="lg" style={styles.authCard}>
          <View style={styles.authHeader}>
            <View style={styles.authIconBox}>
              <Mail size={22} color={Colors.primary} strokeWidth={2.4} />
            </View>
            <View style={styles.authHeaderTextCol}>
              <View style={styles.authStatusRow}>
                <Text maxFontSizeMultiplier={1.4} style={styles.authStatusTitle}>
                  {authEmail ? 'Supabase Authenticated' : 'Guest / Local Mode'}
                </Text>
                <View
                  style={[
                    styles.authBadge,
                    authEmail ? styles.authBadgeConnected : styles.authBadgeGuest,
                  ]}
                >
                  <Text maxFontSizeMultiplier={1.4} style={styles.authBadgeText}>
                    {authEmail ? 'SECURED' : 'OFFLINE'}
                  </Text>
                </View>
              </View>

              {authEmail ? (
                <Text maxFontSizeMultiplier={1.4} style={styles.authEmailText}>
                  {authEmail}
                </Text>
              ) : (
                <Text maxFontSizeMultiplier={1.4} style={styles.authSubtitle}>
                  Sign in with Email OTP to synchronize reports securely over HTTPS with expo-secure-store encryption.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.authSecureStoreNote}>
            <Lock size={13} color={Colors.deepMaroon} />
            <Text maxFontSizeMultiplier={1.4} style={styles.authSecureStoreText}>
              Tokens stored via hardware Keystore/Keychain. Strict HTTPS transmission enforced.
            </Text>
          </View>

          {authEmail ? (
            <Pressable
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out of Supabase account"
              android_ripple={{ color: Colors.ripple, borderless: false }}
              style={styles.authSignOutButton}
            >
              <LogOut size={16} color={Colors.statusAbnormal} strokeWidth={2.2} />
              <Text maxFontSizeMultiplier={1.4} style={styles.authSignOutText}>
                Sign Out of Account
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleOpenAuth}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Email OTP"
              android_ripple={{ color: Colors.rippleLight, borderless: false }}
              style={styles.authActionButton}
            >
              <Mail size={16} color={Colors.white} strokeWidth={2.4} />
              <Text maxFontSizeMultiplier={1.4} style={styles.authActionButtonText}>
                Sign In with Email OTP
              </Text>
            </Pressable>
          )}
        </AppCard>
      </View>

      {/* 9. DPDP Act 2023 & Legal Compliance */}
      <View style={styles.sectionContainer}>
        <SectionHeader
          text="DPDP 2023 &"
          highlightWord="Legal Rights"
          subtitle="Digital Personal Data Protection Act compliance & consent settings"
        />

        <AppCard padding="sm" style={styles.legalCard}>
          <Pressable
            onPress={handleOpenDPDP}
            accessibilityRole="button"
            accessibilityLabel="View DPDP Act 2023 consent notice and granular settings"
            android_ripple={{ color: Colors.ripple, borderless: false }}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <ShieldCheck size={18} color={Colors.statusNormal} strokeWidth={2.2} />
              <Text maxFontSizeMultiplier={1.4} style={styles.menuText}>
                DPDP 2023 Consent Notice & Settings
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.secondaryText} />
          </Pressable>

          <View style={styles.menuDivider} />

          <Pressable
            onPress={handleOpenPrivacy}
            accessibilityRole="button"
            accessibilityLabel="Read ClinixBridge full privacy policy"
            android_ripple={{ color: Colors.ripple, borderless: false }}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <FileCheck2 size={18} color={Colors.deepMaroon} strokeWidth={2.2} />
              <Text maxFontSizeMultiplier={1.4} style={styles.menuText}>
                ClinixBridge Privacy Policy
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.secondaryText} />
          </Pressable>
        </AppCard>
      </View>

      {/* 10. Medical Disclaimer Banner */}
      <View style={styles.disclaimerContainer}>
        <MedicalDisclaimer />
      </View>

      {/* 11. Delete All My Data Button */}
      <Pressable
        onPress={handleDeleteAllData}
        accessibilityRole="button"
        accessibilityLabel="Delete all stored health and user data permanently"
        android_ripple={{ color: Colors.ripple, borderless: false }}
        style={styles.deleteButton}
      >
        <Trash2 size={16} color={Colors.statusAbnormal} />
        <Text maxFontSizeMultiplier={1.4} style={styles.deleteButtonText}>
          Delete All My Data
        </Text>
      </Pressable>

      {/* Auth Modal (Email OTP) */}
      <AuthModal
        visible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
        onSuccess={(email) => {
          setIsAuthModalVisible(false);
          setAuthEmail(email);
        }}
        onOpenDPDPConsent={() => {
          setIsAuthModalVisible(false);
          setIsDPDPConsentVisible(true);
        }}
      />

      {/* DPDP Consent Modal */}
      <DPDPConsentModal
        visible={isDPDPConsentVisible}
        onClose={() => setIsDPDPConsentVisible(false)}
        onAccept={() => {
          setIsDPDPConsentVisible(false);
        }}
        onOpenPrivacyPolicy={() => {
          setIsDPDPConsentVisible(false);
          setIsPrivacyModalVisible(true);
        }}
        isViewOnly={true}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={isPrivacyModalVisible}
        onClose={() => setIsPrivacyModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge * 2.2,
  },
  topHeader: {
    marginBottom: Spacing.md,
  },
  headerSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    letterSpacing: 1,
    fontWeight: '700',
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: Typography.hero.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  userCard: {
    marginBottom: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: Radii.pills,
    backgroundColor: Colors.deepMaroon,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '700',
  },
  userMeta: {
    color: Colors.secondaryText,
    fontFamily: Typography.small.fontFamily,
    fontSize: Typography.small.fontSize,
    marginTop: 2,
  },
  bodyMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.redTint,
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs + 2,
    borderRadius: Radii.sm,
  },
  metricText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  sectionContainer: {
    marginTop: Spacing.lg,
  },
  dietOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  radioCircleActive: {
    borderColor: Colors.deepMaroon,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.deepMaroon,
  },
  dietOptionText: {
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
  },
  dietOptionTextActive: {
    fontWeight: '700',
    color: Colors.deepMaroon,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  debugCard: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  debugHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  debugIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radii.sm,
    backgroundColor: Colors.redTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  debugTextCol: {
    flex: 1,
  },
  debugTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  debugSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginTop: 2,
  },
  loadDemoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radii.pills,
    ...Shadows.soft,
  },
  loadDemoButtonText: {
    color: Colors.white,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    marginLeft: Spacing.sm,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyText: {
    flex: 1,
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.small.fontSize,
    lineHeight: 20,
    marginLeft: Spacing.sm,
  },
  disclaimerContainer: {
    marginTop: Spacing.xl,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pills,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.statusAbnormal,
  },
  deleteButtonText: {
    color: Colors.statusAbnormal,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  toggleIconCol: {
    marginRight: Spacing.md,
  },
  toggleIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleDetails: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  toggleTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  toggleSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  testNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  testNotifBtnText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  exportCard: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  exportIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.redTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  exportTextCol: {
    flex: 1,
  },
  exportTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  exportSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  exportPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pills,
    ...Shadows.card,
  },
  exportPdfButtonText: {
    color: Colors.white,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  authCard: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  authHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  authIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.redTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  authHeaderTextCol: {
    flex: 1,
  },
  authStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authStatusTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  authBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs + 2,
    borderRadius: Radii.sm,
  },
  authBadgeConnected: {
    backgroundColor: Colors.statusNormalBg,
  },
  authBadgeGuest: {
    backgroundColor: Colors.redTint,
  },
  authBadgeText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.deepMaroon,
    letterSpacing: 0.5,
  },
  authEmailText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 13,
    marginTop: 2,
  },
  authSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  authSecureStoreNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    marginBottom: Spacing.md,
  },
  authSecureStoreText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  authActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pills,
    ...Shadows.card,
  },
  authActionButtonText: {
    color: Colors.white,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  authSignOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pills,
    borderWidth: 1.5,
    borderColor: Colors.statusAbnormal,
  },
  authSignOutText: {
    color: Colors.statusAbnormal,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  legalCard: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});
