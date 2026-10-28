import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Activity,
  FlaskConical,
  Salad,
  TrendingUp,
  User,
} from 'lucide-react-native';

import { Colors, Spacing } from '@/theme';
import { FloatingPillNav, NavTabItem } from '@/components/FloatingPillNav';
import { UploadSheetModal } from '@/components/UploadSheetModal';
import { BiomarkerDetailModal } from '@/components/BiomarkerDetailModal';
import { ReviewExtractedValuesModal } from '@/features/reports/ReviewExtractedValuesModal';
import { ExtractedReportResult } from '@/services/api';
import { WelcomeView } from '@/features/onboarding/WelcomeView';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { HomeView } from '@/features/home/HomeView';
import { ReportsView } from '@/features/reports/ReportsView';
import { MealsView } from '@/features/nutrition/MealsView';
import { ProgressView } from '@/features/progress/ProgressView';
import { ProfileView } from '@/features/profile/ProfileView';
import { Biomarker } from '@/data/mock';
import { useAppStore } from '@/store/useAppStore';

type TabKey = 'home' | 'reports' | 'meals' | 'progress' | 'profile';

const NAV_TABS: NavTabItem[] = [
  { id: 'home', label: 'Home', icon: Activity },
  { id: 'reports', label: 'Reports', icon: FlaskConical },
  { id: 'meals', label: 'Meals', icon: Salad },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function AppMainScreen() {
  const {
    isLoading,
    isOnboarded,
    initialize,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [showWelcomeManual, setShowWelcomeManual] = useState<boolean>(false);
  const [welcomePassedToOnboarding, setWelcomePassedToOnboarding] = useState<boolean>(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<Biomarker | null>(null);
  const [uploadSheetVisible, setUploadSheetVisible] = useState<boolean>(false);
  const [reviewData, setReviewData] = useState<ExtractedReportResult | null>(null);

  // Initialize SQLite database and Zustand store on startup
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Android hardware back button handler
  useEffect(() => {
    const handleBack = () => {
      if (reviewData) {
        setReviewData(null);
        return true;
      }
      if (selectedBiomarker) {
        setSelectedBiomarker(null);
        return true;
      }
      if (uploadSheetVisible) {
        setUploadSheetVisible(false);
        return true;
      }
      if (showWelcomeManual) {
        setShowWelcomeManual(false);
        return true;
      }
      if (welcomePassedToOnboarding) {
        setWelcomePassedToOnboarding(false);
        return true;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [reviewData, selectedBiomarker, uploadSheetVisible, showWelcomeManual, welcomePassedToOnboarding, activeTab]);

  // While SQLite is initializing
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // 1. If not onboarded yet: show Welcome -> Onboarding flow
  if (!isOnboarded) {
    if (!welcomePassedToOnboarding) {
      return (
        <WelcomeView
          onGetStarted={() => setWelcomePassedToOnboarding(true)}
        />
      );
    }
    return (
      <OnboardingScreen
        onBackToWelcome={() => setWelcomePassedToOnboarding(false)}
      />
    );
  }

  // 2. If user manually triggered Welcome from Profile screen
  if (showWelcomeManual) {
    return (
      <WelcomeView
        onGetStarted={() => setShowWelcomeManual(false)}
      />
    );
  }

  // 3. Main 5-tab application (onboarding skipped on later launches)
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Active Tab View */}
        <View style={styles.contentArea}>
          {activeTab === 'home' && (
            <HomeView
              onSelectBiomarker={(b) => setSelectedBiomarker(b)}
              onOpenUpload={() => setUploadSheetVisible(true)}
              onNavigateToTab={(t) => setActiveTab(t as TabKey)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              onSelectBiomarker={(b) => setSelectedBiomarker(b)}
              onOpenUpload={() => setUploadSheetVisible(true)}
            />
          )}

          {activeTab === 'meals' && <MealsView />}

          {activeTab === 'progress' && <ProgressView />}

          {activeTab === 'profile' && (
            <ProfileView
              onShowWelcome={() => setShowWelcomeManual(true)}
              onOpenGallery={() => router.push('/gallery')}
            />
          )}
        </View>

        {/* Floating Pill Navigation Bar */}
        <View style={styles.navBarWrapper}>
          <FloatingPillNav
            tabs={NAV_TABS}
            activeTabId={activeTab}
            onTabPress={(tabId) => setActiveTab(tabId as TabKey)}
          />
        </View>

        {/* Upload Sheet Modal */}
        <UploadSheetModal
          visible={uploadSheetVisible}
          onClose={() => setUploadSheetVisible(false)}
          onExtractedSuccess={(data) => {
            setUploadSheetVisible(false);
            setReviewData(data);
          }}
        />

        {/* Review Extracted Values Screen / Modal */}
        <ReviewExtractedValuesModal
          visible={reviewData !== null}
          extractedData={reviewData}
          onClose={() => setReviewData(null)}
          onConfirmSuccess={() => {
            setReviewData(null);
            setActiveTab('reports');
          }}
        />

        {/* Biomarker Detail Modal */}
        <BiomarkerDetailModal
          biomarker={selectedBiomarker}
          visible={selectedBiomarker !== null}
          onClose={() => setSelectedBiomarker(null)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  contentArea: {
    flex: 1,
  },
  navBarWrapper: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
  },
});
