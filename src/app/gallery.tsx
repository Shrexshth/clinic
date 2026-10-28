import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Activity,
  Heart,
  Salad,
  User,
  FlaskConical,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';

import {
  Colors,
  Radii,
  Spacing,
  Typography,
  Shadows,
} from '@/theme';
import { AppCard } from '@/components/AppCard';
import { HeroCard } from '@/components/HeroCard';
import { PillChip } from '@/components/PillChip';
import { CircleArrowButton } from '@/components/CircleArrowButton';
import { StatusChip } from '@/components/StatusChip';
import { SectionHeader } from '@/components/SectionHeader';
import { FloatingPillNav, NavTabItem } from '@/components/FloatingPillNav';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import {
  SkeletonBox,
  SkeletonCard,
  SkeletonReportCard,
  SkeletonMealCard,
} from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

const NAV_TABS: NavTabItem[] = [
  { id: 'dashboard', label: 'Summary', icon: Activity },
  { id: 'labs', label: 'Labs', icon: FlaskConical },
  { id: 'nutrition', label: 'Nutrition', icon: Salad },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function GalleryScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeNavTab, setActiveNavTab] = useState<string>('dashboard');
  const [interactiveCounter, setInteractiveCounter] = useState<number>(0);

  // Android back button handling
  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const categories = [
    'All',
    'Cards',
    'Chips',
    'Buttons',
    'Navigation',
    'States',
    'Tokens',
  ];

  const shouldShow = (cat: string) => {
    return selectedCategory === 'All' || selectedCategory === cat;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <CircleArrowButton
            direction="left"
            onPress={() => router.back()}
            size={40}
          />
          <View style={styles.headerTitles}>
            <Text style={styles.headerSubtitle}>DESIGN SYSTEM</Text>
            <Text style={styles.headerTitle}>
              Component <Text style={{ color: Colors.primary }}>Gallery</Text>
            </Text>
          </View>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map((cat) => (
            <PillChip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
              style={styles.filterChip}
            />
          ))}
        </ScrollView>

        {/* 1. HeroCard Section */}
        {shouldShow('Cards') && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              text="Crimson"
              highlightWord="HeroCard"
              subtitle="Crimson to maroon gradient with white typography"
            />
            <HeroCard
              badge="Clinical Biomarker Analysis"
              title="Iron Deficiency Anemia"
              subtitle="Serum Ferritin 14 ng/mL and Hemoglobin 10.9 g/dL require dietary repletion and iron-vitamin C pairing."
              rightAction={
                <CircleArrowButton
                  direction="up-right"
                  onPress={() => setInteractiveCounter((c) => c + 1)}
                  size={38}
                  arrowColor={Colors.deepMaroon}
                />
              }
            >
              <View style={styles.heroFooter}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>-38%</Text>
                  <Text style={styles.heroStatLabel}>Ferritin Deficit</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>4 Key</Text>
                  <Text style={styles.heroStatLabel}>Nutrient Targets</Text>
                </View>
              </View>
            </HeroCard>
          </View>
        )}

        {/* 2. AppCard Section */}
        {shouldShow('Cards') && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              text="Surface"
              highlightWord="AppCard"
              subtitle="Pure white surface with 24px radius and soft shadow"
            />

            <AppCard padding="lg" style={styles.cardItem}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Hemoglobin (Hb)</Text>
                  <Text style={styles.cardCategory}>Complete Blood Count</Text>
                </View>
                <StatusChip status="abnormal" label="10.9 g/dL" />
              </View>
              <Text style={styles.cardDescription}>
                Carries oxygen from your lungs to your organs. Below normal adult range (13.0 - 16.5 g/dL).
              </Text>
            </AppCard>

            <AppCard
              padding="lg"
              style={styles.cardItem}
              onPress={() => setInteractiveCounter((c) => c + 1)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.interactiveRow}>
                  <View style={styles.iconBadge}>
                    <Heart size={18} color={Colors.primary} />
                  </View>
                  <View style={{ marginLeft: Spacing.sm }}>
                    <Text style={styles.cardTitle}>Interactive Card</Text>
                    <Text style={styles.cardCategory}>Taps counted: {interactiveCounter}</Text>
                  </View>
                </View>
                <CircleArrowButton
                  direction="right"
                  onPress={() => setInteractiveCounter((c) => c + 1)}
                  size={36}
                />
              </View>
            </AppCard>
          </View>
        )}

        {/* 3. StatusChip Section */}
        {shouldShow('Chips') && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              text="Accessible"
              highlightWord="StatusChip"
              subtitle="Always pairs icon + text label — never color alone"
            />
            <AppCard padding="lg">
              <Text style={styles.chipIntroText}>
                Clinical accessibility rule: Biomarker states are immediately clear through both distinct iconography and readable labels.
              </Text>
              <View style={styles.chipsGrid}>
                <StatusChip status="normal" label="Normal (Optimal)" />
                <StatusChip status="borderline" label="Borderline Elevated" />
                <StatusChip status="abnormal" label="Abnormal (Low)" />
              </View>
            </AppCard>
          </View>
        )}

        {/* 4. PillChip Section */}
        {shouldShow('Chips') && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              text="Interactive"
              highlightWord="PillChip"
              subtitle="Maroon fill when selected, white with border when unselected"
            />
            <AppCard padding="lg">
              <Text style={styles.chipIntroText}>
                Selectable filter pills for blood report panels:
              </Text>
              <View style={styles.chipsWrap}>
                <PillChip
                  label="All Markers"
                  selected={selectedCategory === 'All'}
                  onPress={() => setSelectedCategory('All')}
                />
                <PillChip
                  label="Iron & CBC"
                  selected={selectedCategory === 'Cards'}
                  onPress={() => setSelectedCategory('Cards')}
                />
                <PillChip
                  label="Metabolic"
                  selected={selectedCategory === 'Chips'}
                  onPress={() => setSelectedCategory('Chips')}
                />
                <PillChip
                  label="Lipid Profile"
                  selected={selectedCategory === 'Buttons'}
                  onPress={() => setSelectedCategory('Buttons')}
                />
              </View>
            </AppCard>
          </View>
        )}

        {/* 5. CircleArrowButton Section */}
        {shouldShow('Buttons') && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              text="Action"
              highlightWord="CircleArrowButton"
              subtitle="White circular tap target with directional Lucide arrows"
            />
            <AppCard padding="lg">
              <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                  <CircleArrowButton
                    direction="right"
                    onPress={() => setInteractiveCounter((c) => c + 1)}
                  />
                  <Text style={styles.buttonCaption}>Right</Text>
                </View>

                <View style={styles.buttonWrapper}>
                  <CircleArrowButton
                    direction="up-right"
                    onPress={() => setInteractiveCounter((c) => c + 1)}
                  />
                  <Text style={styles.buttonCaption}>Up-Right</Text>
                </View>

                <View style={styles.buttonWrapper}>
                  <CircleArrowButton
                    direction="left"
                    onPress={() => setInteractiveCounter((c) => c + 1)}
                  />
                  <Text style={styles.buttonCaption}>Left</Text>
                </View>
              </View>
            </AppCard>
          </View>
        )}

        {/* 6. SectionHeader Showcase */}
        {shouldShow('Cards') && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              text="Component"
              highlightWord="SectionHeader"
              subtitle="Two-tone headlines where the emphasized term is crimson"
            />
            <AppCard padding="lg">
              <SectionHeader
                text="Personalized"
                highlightWord="Nutrition"
                subtitle="Evidence-based dietary cofactors tailored to blood markers"
              />
              <SectionHeader
                text="Cardiometabolic"
                highlightWord="Risk"
                subtitle="Atherogenic particle density and systemic inflammation"
              />
            </AppCard>
          </View>
        )}

        {/* 7. FloatingPillNav Section */}
        {shouldShow('Navigation') && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              text="Floating"
              highlightWord="FloatingPillNav"
              subtitle="Dark maroon floating pill tab bar with red circle active tab"
            />
            <AppCard padding="lg">
              <Text style={styles.chipIntroText}>
                Active tab: <Text style={{ fontWeight: '700', color: Colors.primary }}>{activeNavTab.toUpperCase()}</Text>
              </Text>
              <View style={{ marginTop: Spacing.md }}>
                <FloatingPillNav
                  tabs={NAV_TABS}
                  activeTabId={activeNavTab}
                  onTabPress={(id) => setActiveNavTab(id)}
                />
              </View>
            </AppCard>
          </View>
        )}

        {/* 7. Loading Skeletons, Empty States & Error States */}
        {shouldShow('States') && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              text="Feedback &"
              highlightWord="States"
              subtitle="Animated skeletons, welcoming empty states, and friendly error alerts"
            />

            {/* Skeletons */}
            <Text style={[styles.componentSubHeading, { marginTop: Spacing.sm }]}>
              Animated Pulse Skeletons:
            </Text>
            <SkeletonCard />
            <SkeletonReportCard />
            <SkeletonMealCard />

            {/* Empty State */}
            <Text style={[styles.componentSubHeading, { marginTop: Spacing.md }]}>
              Empty State:
            </Text>
            <EmptyState
              title="No Blood Reports Found"
              description="Upload your laboratory test document or seed demo data to inspect biomarker trends."
              actionLabel="Upload First Report"
              onAction={() => setInteractiveCounter((c) => c + 1)}
            />

            {/* Error State */}
            <Text style={[styles.componentSubHeading, { marginTop: Spacing.md }]}>
              Error Alert State:
            </Text>
            <ErrorState
              title="Connection Timeout"
              message="Could not reach the clinical analysis engine. Please verify network access and retry."
              retryLabel="Retry Connection"
              onRetry={() => setInteractiveCounter((c) => c + 1)}
            />
          </View>
        )}

        {/* 8. Theme Tokens Swatches */}
        {shouldShow('Tokens') && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              text="Color"
              highlightWord="Tokens"
              subtitle="Brand and clinical palette specifications"
            />
            <AppCard padding="lg">
              <View style={styles.swatchGrid}>
                {[
                  { name: 'Primary', hex: Colors.primary },
                  { name: 'Deep Maroon', hex: Colors.deepMaroon },
                  { name: 'Dark', hex: Colors.dark },
                  { name: 'Background', hex: Colors.background },
                  { name: 'Card', hex: Colors.card },
                  { name: 'Red Tint', hex: Colors.redTint },
                  { name: 'Text', hex: Colors.text },
                  { name: 'Secondary Text', hex: Colors.secondaryText },
                  { name: 'Normal', hex: Colors.statusNormal },
                  { name: 'Borderline', hex: Colors.statusBorderline },
                  { name: 'Abnormal', hex: Colors.statusAbnormal },
                ].map((swatch) => (
                  <View key={swatch.name} style={styles.swatchItem}>
                    <View
                      style={[
                        styles.swatchBox,
                        {
                          backgroundColor: swatch.hex,
                          borderWidth: swatch.hex === '#FFFFFF' || swatch.hex === '#FBF4F4' ? 1 : 0,
                          borderColor: Colors.border,
                        },
                      ]}
                    />
                    <Text style={styles.swatchName}>{swatch.name}</Text>
                    <Text style={styles.swatchHex}>{swatch.hex}</Text>
                  </View>
                ))}
              </View>
            </AppCard>
          </View>
        )}

        {/* Medical Disclaimer Banner */}
        <View style={styles.disclaimerContainer}>
          <MedicalDisclaimer />
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.huge,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  headerTitles: {
    marginLeft: Spacing.md,
  },
  headerSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    letterSpacing: 1,
    fontWeight: '700',
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: Typography.hero.fontFamily,
    fontSize: Typography.hero.fontSize,
    lineHeight: Typography.hero.lineHeight,
    fontWeight: '700',
  },
  filterRow: {
    paddingBottom: Spacing.md,
  },
  filterChip: {
    marginRight: Spacing.sm,
  },
  sectionContainer: {
    marginTop: Spacing.xl,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    color: Colors.white,
    fontFamily: Typography.title.fontFamily,
    fontSize: Typography.title.fontSize,
    lineHeight: Typography.title.lineHeight,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardItem: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    color: Colors.text,
    fontFamily: Typography.title.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    lineHeight: Typography.bodyLarge.lineHeight,
    fontWeight: '700',
  },
  cardCategory: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginTop: 2,
  },
  cardDescription: {
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
  interactiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    backgroundColor: Colors.redTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipIntroText: {
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    marginBottom: Spacing.md,
  },
  componentSubHeading: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  chipsGrid: {
    gap: Spacing.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  buttonCaption: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  swatchItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  swatchBox: {
    width: 44,
    height: 44,
    borderRadius: Radii.sm,
    marginBottom: Spacing.xs,
    ...Shadows.soft,
  },
  swatchName: {
    color: Colors.text,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    fontWeight: '700',
    textAlign: 'center',
  },
  swatchHex: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  disclaimerContainer: {
    marginTop: Spacing.xxl,
  },
});
