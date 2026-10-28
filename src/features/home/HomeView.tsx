import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  Bell,
  Upload,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { AppCard } from '@/components/AppCard';
import { HeroCard } from '@/components/HeroCard';
import { PillChip } from '@/components/PillChip';
import { CircleArrowButton } from '@/components/CircleArrowButton';
import { StatusChip } from '@/components/StatusChip';
import { SectionHeader } from '@/components/SectionHeader';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { SkeletonCard, SkeletonReportCard } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { triggerLightHaptic, triggerMediumHaptic } from '@/utils/haptics';
import { Biomarker, BloodReportData, UserProfileData } from '@/data/mock';
import { reportRepository } from '../reports/repository';
import { profileRepository } from '../profile/repository';

export interface HomeViewProps {
  onSelectBiomarker: (biomarker: Biomarker) => void;
  onOpenUpload: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export function HomeView({
  onSelectBiomarker,
  onOpenUpload,
  onNavigateToTab,
}: HomeViewProps) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [report, setReport] = useState<BloodReportData | null>(null);
  const [flaggedBiomarkers, setFlaggedBiomarkers] = useState<Biomarker[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [filteredList, setFilteredList] = useState<Biomarker[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const p = await profileRepository.getUserProfile();
        setProfile(p);
        const r = await reportRepository.getLatestReport();
        setReport(r);
        const flagged = await reportRepository.getFlaggedBiomarkers();
        setFlaggedBiomarkers(flagged);
        setFilteredList(flagged);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFilterChange = async (cat: string) => {
    triggerLightHaptic();
    setSelectedFilter(cat);
    if (cat === 'All') {
      setFilteredList(flaggedBiomarkers);
    } else {
      const matched = flaggedBiomarkers.filter((b) => b.category === cat);
      setFilteredList(matched);
    }
  };

  const filterCategories = ['All', 'Blood', 'Lipids', 'Vitamins', 'Thyroid', 'Sugar'];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header: "Good morning, <name>" & Bell Icon */}
      <View style={styles.topGreetingRow}>
        <View>
          <Text style={styles.greetingText}>
            Good morning, {profile?.name ? profile.name.split(' ')[0] : 'Alex'}
          </Text>
          <Text style={styles.subGreetingText}>Let’s review your biomarker targets today.</Text>
        </View>

        <View style={styles.topActions}>
          <Pressable
            onPress={() => onNavigateToTab('reports')}
            android_ripple={{ color: Colors.ripple, borderless: true }}
            style={styles.bellButton}
          >
            <Bell size={20} color={Colors.text} strokeWidth={2.2} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
      </View>

      {/* 2. Headline: "Your Health Overview" with one red word */}
      <SectionHeader
        text="Your Health"
        highlightWord="Overview"
        subtitle="Clinical analysis based on deterministic laboratory rules"
        rightAction={
          <Pressable
            onPress={onOpenUpload}
            android_ripple={{ color: Colors.ripple, borderless: false }}
            style={styles.uploadActionButton}
          >
            <Upload size={14} color={Colors.white} strokeWidth={2.4} />
            <Text style={styles.uploadActionText}>Upload Report</Text>
          </Pressable>
        }
        style={{ marginTop: Spacing.sm }}
      />

      {/* 3. HeroCard for Latest Report */}
      {report && (
        <HeroCard
          badge={report.labName}
          title={report.flaggedCountMessage}
          subtitle={`Report from ${report.date}. Overall wellness score 76/100.`}
          rightAction={
            <CircleArrowButton
              direction="right"
              onPress={() => onNavigateToTab('reports')}
              size={40}
              arrowColor={Colors.deepMaroon}
            />
          }
        >
          <View style={styles.heroStrip}>
            <View style={styles.heroStripItem}>
              <Text style={styles.heroNumber}>{report.normalCount}</Text>
              <Text style={styles.heroLabel}>Normal</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStripItem}>
              <Text style={[styles.heroNumber, { color: Colors.statusBorderline }]}>
                {report.borderlineCount}
              </Text>
              <Text style={styles.heroLabel}>Borderline</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStripItem}>
              <Text style={[styles.heroNumber, { color: Colors.redTint }]}>
                {report.abnormalCount}
              </Text>
              <Text style={styles.heroLabel}>Critical Low</Text>
            </View>
          </View>
        </HeroCard>
      )}

      {/* 4. Filter Chips (All, Blood, Lipids, Vitamins, Thyroid, Sugar) */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filter Biomarkers by Panel:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filterCategories.map((cat) => (
            <PillChip
              key={cat}
              label={cat}
              selected={selectedFilter === cat}
              onPress={() => handleFilterChange(cat)}
              style={styles.filterChip}
            />
          ))}
        </ScrollView>
      </View>

      {/* 5. Cards for Flagged Biomarkers, each with CircleArrowButton */}
      <View style={styles.flaggedSection}>
        <SectionHeader
          text="Flagged"
          highlightWord="Biomarkers"
          subtitle="Requires dietary focus or clinical follow-up"
          rightAction={
            <Pressable onPress={() => onNavigateToTab('reports')}>
              <Text style={styles.viewAllText}>View All ({report?.totalCount || 18}) ›</Text>
            </Pressable>
          }
        />

        {isLoading ? (
          <View>
            <SkeletonReportCard />
            <SkeletonReportCard />
          </View>
        ) : filteredList.length === 0 ? (
          <EmptyState
            title="All Markers Optimal"
            description={`No flagged biomarkers found in the "${selectedFilter}" category. Your nutrition and lifestyle habits are supporting your targets.`}
            actionLabel="View All Reports"
            onAction={() => {
              triggerLightHaptic();
              onNavigateToTab('reports');
            }}
          />
        ) : (
          filteredList.map((item) => (
            <AppCard
              key={item.id}
              padding="lg"
              style={styles.flaggedCard}
              onPress={() => {
                triggerLightHaptic();
                onSelectBiomarker(item);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, value ${item.value} ${item.unit}, status ${item.statusLabel}`}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.cardName}>{item.name}</Text>
                  <Text maxFontSizeMultiplier={1.4} style={styles.cardCategory}>{item.category} Panel</Text>
                </View>

                <StatusChip status={item.status} label={item.statusLabel} />
              </View>

              {/* Value and Arrow Button Row */}
              <View style={styles.cardValueRow}>
                <View>
                  <Text maxFontSizeMultiplier={1.4} style={styles.cardValue}>
                    {item.value} <Text style={styles.cardUnit}>{item.unit}</Text>
                  </Text>
                  <Text maxFontSizeMultiplier={1.4} style={styles.cardRangeNote}>
                    Optimal: {item.optimalMin} - {item.optimalMax} {item.unit}
                  </Text>
                </View>

                <CircleArrowButton
                  direction="right"
                  onPress={() => {
                    triggerLightHaptic();
                    onSelectBiomarker(item);
                  }}
                  size={38}
                />
              </View>

              {item.flaggedReason && (
                <View style={styles.reasonBox}>
                  <AlertCircle size={14} color={Colors.deepMaroon} />
                  <Text maxFontSizeMultiplier={1.4} style={styles.reasonText}>{item.flaggedReason}</Text>
                </View>
              )}
            </AppCard>
          ))
        )}
      </View>

      {/* Quick Action: Nutrition Plan Preview */}
      <AppCard
        padding="lg"
        style={styles.nutritionPreviewCard}
        onPress={() => onNavigateToTab('meals')}
      >
        <View style={styles.nutritionPreviewRow}>
          <View style={styles.sparkleIconBox}>
            <Sparkles size={20} color={Colors.primary} strokeWidth={2.4} />
          </View>
          <View style={styles.nutritionPreviewContent}>
            <Text style={styles.nutritionPreviewTitle}>Personalized Nutrition Plan</Text>
            <Text style={styles.nutritionPreviewText}>
              Targeted recipes and food pairings matched to your low Ferritin and elevated Glucose.
            </Text>
          </View>
          <CircleArrowButton
            direction="right"
            onPress={() => onNavigateToTab('meals')}
            size={36}
          />
        </View>
      </AppCard>

      {/* 6. Medical Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <MedicalDisclaimer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge * 2.2,
  },
  topGreetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greetingText: {
    color: Colors.text,
    fontFamily: Typography.hero.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  subGreetingText: {
    color: Colors.secondaryText,
    fontFamily: Typography.small.fontFamily,
    fontSize: Typography.small.fontSize,
    lineHeight: Typography.small.lineHeight,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.pills,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.soft,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  uploadActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pills,
  },
  uploadActionText: {
    color: Colors.white,
    fontFamily: Typography.smallBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  heroStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  heroStripItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroNumber: {
    color: Colors.white,
    fontFamily: Typography.title.fontFamily,
    fontSize: Typography.title.fontSize,
    lineHeight: Typography.title.lineHeight,
    fontWeight: '800',
  },
  heroLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  filterTitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.smallBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    lineHeight: Typography.smallBold.lineHeight,
    marginBottom: Spacing.xs,
  },
  filterRow: {
    paddingVertical: Spacing.xs,
  },
  filterChip: {
    marginRight: Spacing.sm,
  },
  flaggedSection: {
    marginTop: Spacing.md,
  },
  viewAllText: {
    color: Colors.primary,
    fontFamily: Typography.smallBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '700',
  },
  flaggedCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardName: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
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
  cardValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  cardValue: {
    color: Colors.text,
    fontFamily: Typography.display.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  cardUnit: {
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '400',
  },
  cardRangeNote: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginTop: 2,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.redTint,
    borderRadius: Radii.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.md,
  },
  reasonText: {
    flex: 1,
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  nutritionPreviewCard: {
    marginTop: Spacing.md,
  },
  nutritionPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.redTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionPreviewContent: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  nutritionPreviewTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '700',
  },
  nutritionPreviewText: {
    color: Colors.secondaryText,
    fontFamily: Typography.small.fontFamily,
    fontSize: Typography.small.fontSize,
    lineHeight: Typography.small.lineHeight,
    marginTop: 2,
  },
  noMarkersText: {
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    textAlign: 'center',
  },
  disclaimerContainer: {
    marginTop: Spacing.xl,
  },
});
