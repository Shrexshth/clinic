import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Upload,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Calendar,
  FileText,
} from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { AppCard } from '@/components/AppCard';
import { PillChip } from '@/components/PillChip';
import { StatusChip } from '@/components/StatusChip';
import { SectionHeader } from '@/components/SectionHeader';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { SkeletonReportCard } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
} from '@/utils/haptics';
import { Biomarker, BloodReportData } from '@/data/mock';
import { reportRepository } from './repository';
import { exportReportSummaryAsPdf } from '@/services/pdfExport';
import { useAppStore } from '@/store/useAppStore';

export interface ReportsViewProps {
  onSelectBiomarker: (biomarker: Biomarker) => void;
  onOpenUpload: () => void;
}

export function ReportsView({
  onSelectBiomarker,
  onOpenUpload,
}: ReportsViewProps) {
  const { userProfile } = useAppStore();
  const [report, setReport] = useState<BloodReportData | null>(null);
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadReport() {
      setIsLoading(true);
      try {
        const rep = await reportRepository.getLatestReport();
        setReport(rep);
        setBiomarkers(rep.biomarkers);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, []);

  const categories = ['All', 'Blood', 'Lipids', 'Vitamins', 'Thyroid', 'Sugar', 'Organ Function'];

  const filteredBiomarkers = biomarkers.filter((b) => {
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleExportPdf = async () => {
    triggerMediumHaptic();
    if (!report) return;
    try {
      setIsExportingPdf(true);
      const res = await exportReportSummaryAsPdf({
        report,
        profile: userProfile,
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

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerSubtitle}>LABORATORY RESULTS</Text>
          <Text style={styles.headerTitle}>
            Blood <Text style={{ color: Colors.primary }}>Report</Text>
          </Text>
        </View>

        <View style={styles.headerButtonsRow}>
          <Pressable
            onPress={handleExportPdf}
            disabled={isExportingPdf}
            android_ripple={{ color: Colors.ripple, borderless: false }}
            style={styles.exportPdfBtn}
          >
            {isExportingPdf ? (
              <ActivityIndicator size="small" color={Colors.deepMaroon} />
            ) : (
              <>
                <FileText size={14} color={Colors.deepMaroon} strokeWidth={2.4} />
                <Text style={styles.exportPdfBtnText}>Export PDF</Text>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={onOpenUpload}
            android_ripple={{ color: Colors.ripple, borderless: false }}
            style={styles.uploadBtn}
          >
            <Upload size={14} color={Colors.white} strokeWidth={2.4} />
            <Text style={styles.uploadBtnText}>Upload New</Text>
          </Pressable>
        </View>
      </View>

      {/* Lab Metadata Banner */}
      {report && (
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={13} color={Colors.secondaryText} />
            <Text style={styles.metaText}>{report.date}</Text>
          </View>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaText}>{report.labName}</Text>
        </View>
      )}

      {/* 1. Summary Strip (14 normal, 3 borderline, 1 low) */}
      <View style={styles.summaryStripContainer}>
        <View style={styles.summaryStrip}>
          {/* Normal */}
          <View style={styles.summaryItem}>
            <View style={styles.summaryBadgeNormal}>
              <CheckCircle2 size={16} color={Colors.statusNormal} strokeWidth={2.5} />
              <Text style={styles.summaryCountNormal}>14</Text>
            </View>
            <Text style={styles.summaryLabel}>Normal</Text>
          </View>

          <View style={styles.stripDivider} />

          {/* Borderline */}
          <View style={styles.summaryItem}>
            <View style={styles.summaryBadgeBorderline}>
              <AlertTriangle size={16} color={Colors.statusBorderline} strokeWidth={2.5} />
              <Text style={styles.summaryCountBorderline}>3</Text>
            </View>
            <Text style={styles.summaryLabel}>Borderline</Text>
          </View>

          <View style={styles.stripDivider} />

          {/* Low / Critical */}
          <View style={styles.summaryItem}>
            <View style={styles.summaryBadgeLow}>
              <AlertCircle size={16} color={Colors.statusAbnormal} strokeWidth={2.5} />
              <Text style={styles.summaryCountLow}>1</Text>
            </View>
            <Text style={styles.summaryLabel}>Low</Text>
          </View>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={Colors.secondaryText} />
        <TextInput
          placeholder="Search by biomarker or panel..."
          placeholderTextColor={Colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
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

      {/* Biomarker Cards with Value, Unit, Range Bar with Marker, and StatusChip */}
      <View style={styles.cardsList}>
        <SectionHeader
          text="Complete"
          highlightWord="Biomarkers"
          subtitle={`Showing ${filteredBiomarkers.length} tested laboratory parameters`}
        />

        {isLoading ? (
          <View>
            <SkeletonReportCard />
            <SkeletonReportCard />
            <SkeletonReportCard />
          </View>
        ) : filteredBiomarkers.length === 0 ? (
          searchQuery.trim() !== '' ? (
            <EmptyState
              title="No Biomarkers Found"
              description={`No laboratory marker matches "${searchQuery}". Try searching for another panel or clearing filters.`}
              actionLabel="Clear Search"
              onAction={() => setSearchQuery('')}
            />
          ) : (
            <EmptyState
              title="No Reports Available"
              description="No blood biomarkers found in local storage. Upload a lab report or load demo data."
              actionLabel="Upload Blood Report"
              onAction={() => {
                triggerLightHaptic();
                onOpenUpload();
              }}
            />
          )
        ) : (
          filteredBiomarkers.map((item) => {
            // Calculate gauge position
            const rangeSpan = item.maxRange - item.minRange;
            const clampedVal = Math.max(item.minRange, Math.min(item.maxRange, item.value));
            const pointerPercent = Math.max(4, Math.min(96, Math.round(((clampedVal - item.minRange) / rangeSpan) * 100)));

            return (
              <AppCard
                key={item.id}
                padding="lg"
                style={styles.biomarkerCard}
                onPress={() => {
                  triggerLightHaptic();
                  onSelectBiomarker(item);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, value ${item.value} ${item.unit}, status ${item.statusLabel}`}
              >
                {/* Header: Name and StatusChip */}
                <View style={styles.cardTopRow}>
                  <View style={styles.nameWrap}>
                    <Text maxFontSizeMultiplier={1.4} style={styles.biomarkerName}>{item.name}</Text>
                    <Text maxFontSizeMultiplier={1.4} style={styles.biomarkerCat}>{item.category} Panel</Text>
                  </View>
                  <StatusChip status={item.status} label={item.statusLabel} />
                </View>

                {/* Value and Unit */}
                <View style={styles.valueRow}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.valueText}>
                    {item.value} <Text style={styles.unitText}>{item.unit}</Text>
                  </Text>
                  <Text maxFontSizeMultiplier={1.4} style={styles.targetText}>
                    Optimal: {item.optimalMin} - {item.optimalMax} {item.unit}
                  </Text>
                </View>

                {/* Range Bar with Marker */}
                <View
                  style={styles.rangeBarContainer}
                  accessible={true}
                  accessibilityLabel={`Range: low below ${item.minRange}, high above ${item.maxRange}. Current position: ${pointerPercent}%`}
                >
                  <View style={styles.rangeBarTrack}>
                    {/* Low Zone */}
                    <View style={[styles.rangeSegment, { backgroundColor: Colors.statusAbnormal, flex: 1 }]} />
                    {/* Optimal Zone */}
                    <View style={[styles.rangeSegment, { backgroundColor: Colors.statusNormal, flex: 2 }]} />
                    {/* High Zone */}
                    <View style={[styles.rangeSegment, { backgroundColor: Colors.statusBorderline, flex: 1.2 }]} />
                  </View>

                  {/* Marker pointer */}
                  <View style={[styles.rangePointer, { left: `${pointerPercent}%` }]}>
                    <View style={styles.pointerDiamond} />
                  </View>
                </View>

                <View style={styles.rangeLabelsRow}>
                  <Text maxFontSizeMultiplier={1.4} style={styles.rangeLabel}>Low (&lt;{item.minRange})</Text>
                  <Text maxFontSizeMultiplier={1.4} style={styles.rangeLabel}>High (&gt;{item.maxRange})</Text>
                </View>
              </AppCard>
            );
          })
        )}
      </View>

      {/* Medical Disclaimer Banner */}
      <View style={styles.disclaimerWrapper}>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
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
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  exportPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radii.pills,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  exportPdfBtnText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.smallBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '700',
    marginLeft: 4,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pills,
  },
  uploadBtnText: {
    color: Colors.white,
    fontFamily: Typography.smallBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: Colors.secondaryText,
    fontFamily: Typography.small.fontFamily,
    fontSize: Typography.small.fontSize,
    marginLeft: 4,
  },
  metaDivider: {
    color: Colors.secondaryText,
    marginHorizontal: Spacing.sm,
  },
  summaryStripContainer: {
    marginBottom: Spacing.lg,
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radii.cards,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBadgeNormal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.statusNormalBg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radii.pills,
  },
  summaryCountNormal: {
    color: Colors.statusNormal,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '800',
    marginLeft: 4,
  },
  summaryBadgeBorderline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.statusBorderlineBg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radii.pills,
  },
  summaryCountBorderline: {
    color: Colors.statusBorderline,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '800',
    marginLeft: 4,
  },
  summaryBadgeLow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.statusAbnormalBg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radii.pills,
  },
  summaryCountLow: {
    color: Colors.statusAbnormal,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '800',
    marginLeft: 4,
  },
  summaryLabel: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  stripDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pills,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
  },
  chipsScroll: {
    paddingBottom: Spacing.md,
  },
  filterChip: {
    marginRight: Spacing.sm,
  },
  cardsList: {
    marginTop: Spacing.sm,
  },
  biomarkerCard: {
    marginBottom: Spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  nameWrap: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  biomarkerName: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    lineHeight: Typography.bodyLarge.lineHeight,
    fontWeight: '700',
  },
  biomarkerCat: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    marginTop: 2,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: Spacing.xs,
  },
  valueText: {
    color: Colors.text,
    fontFamily: Typography.title.fontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  unitText: {
    color: Colors.secondaryText,
    fontFamily: Typography.small.fontFamily,
    fontSize: Typography.small.fontSize,
    fontWeight: '400',
  },
  targetText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
  },
  rangeBarContainer: {
    position: 'relative',
    height: 18,
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  rangeBarTrack: {
    height: 8,
    width: '100%',
    flexDirection: 'row',
    borderRadius: Radii.pills,
    overflow: 'hidden',
  },
  rangeSegment: {
    height: '100%',
  },
  rangePointer: {
    position: 'absolute',
    top: 2,
    marginLeft: -7,
    alignItems: 'center',
  },
  pointerDiamond: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: Colors.dark,
    borderColor: Colors.card,
  },
  rangeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  rangeLabel: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
  },
  disclaimerWrapper: {
    marginTop: Spacing.xl,
  },
});
