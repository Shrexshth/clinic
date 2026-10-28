import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { TrendingUp, Calendar, Info, Sparkles } from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { AppCard } from '@/components/AppCard';
import { PillChip } from '@/components/PillChip';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusChip } from '@/components/StatusChip';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { BiomarkerTrendChart } from '@/components/BiomarkerTrendChart';
import { Biomarker } from '@/data/mock';
import { reportRepository } from '../reports/repository';

export function ProgressView() {
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [selectedId, setSelectedId] = useState<string>('ferritin');
  const [activeMarker, setActiveMarker] = useState<Biomarker | null>(null);

  useEffect(() => {
    async function loadBiomarkers() {
      const all = await reportRepository.getAllBiomarkers();
      setBiomarkers(all);
      const initial = all.find((b) => b.id === 'ferritin') || all[0];
      setActiveMarker(initial);
    }
    loadBiomarkers();
  }, []);

  const handleSelectBiomarker = (id: string) => {
    setSelectedId(id);
    const found = biomarkers.find((b) => b.id === id);
    if (found) setActiveMarker(found);
  };

  const chartBiomarkers = [
    { id: 'ferritin', label: 'Ferritin' },
    { id: 'fasting_glucose', label: 'Glucose' },
    { id: 'vitamin_d', label: 'Vitamin D' },
    { id: 'triglycerides', label: 'Triglycerides' },
    { id: 'hemoglobin', label: 'Hemoglobin' },
  ];

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(360, screenWidth - Spacing.lg * 4);

  // Prepare chart points
  const chartPoints = (activeMarker?.progressChartData || []).map((pt) => ({
    value: pt.value,
    label: pt.label,
    dataPointText: `${pt.value}`,
    textColor: Colors.deepMaroon,
    textFontSize: 11,
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>HISTORICAL TRENDS</Text>
          <Text style={styles.headerTitle}>
            Biomarker <Text style={{ color: Colors.primary }}>Progress</Text>
          </Text>
        </View>
      </View>

      {/* Biomarker Selector Chips */}
      <View style={styles.chipsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {chartBiomarkers.map((b) => (
            <PillChip
              key={b.id}
              label={b.label}
              selected={selectedId === b.id}
              onPress={() => handleSelectBiomarker(b.id)}
              style={styles.chip}
            />
          ))}
        </ScrollView>
      </View>

      {activeMarker && (
        <View>
          {/* Main Trend Chart with Shaded Reference Band & Trajectory Label */}
          <BiomarkerTrendChart
            biomarkerName={activeMarker.name}
            unit={activeMarker.unit}
            optimalMin={activeMarker.optimalMin}
            optimalMax={activeMarker.optimalMax}
            minRange={activeMarker.minRange}
            maxRange={activeMarker.maxRange}
            history={activeMarker.progressChartData}
          />

          {/* Historical Checkpoints Card */}
          <SectionHeader
            text="Chronological"
            highlightWord="Checkpoints"
            subtitle="Laboratory test history for this biomarker"
            style={{ marginTop: Spacing.xl }}
          />

          <AppCard padding="lg">
            {activeMarker.progressChartData.map((pt, i) => (
              <View key={i} style={styles.checkpointRow}>
                <View style={styles.checkpointDateCol}>
                  <Calendar size={14} color={Colors.secondaryText} />
                  <Text style={styles.checkpointDate}>{pt.date}</Text>
                </View>

                <Text style={styles.checkpointValue}>
                  {pt.value} {activeMarker.unit}
                </Text>
              </View>
            ))}
          </AppCard>
        </View>
      )}

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
  chipsSection: {
    marginBottom: Spacing.md,
  },
  chipsRow: {
    paddingVertical: 2,
  },
  chip: {
    marginRight: Spacing.sm,
  },
  chartCard: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.card,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  markerName: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    lineHeight: Typography.bodyLarge.lineHeight,
    fontWeight: '700',
  },
  markerCategory: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    marginTop: 2,
  },
  referenceBandLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.statusNormalBg,
    borderRadius: Radii.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.statusNormal,
    marginRight: Spacing.xs,
  },
  legendText: {
    color: Colors.statusNormal,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  chartWrapper: {
    marginVertical: Spacing.sm,
    alignItems: 'center',
    overflow: 'hidden',
  },
  axisText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
  },
  rangeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: Spacing.sm,
  },
  rangeInfoText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
  },
  checkpointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  checkpointDateCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkpointDate: {
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    marginLeft: Spacing.xs,
  },
  checkpointValue: {
    color: Colors.deepMaroon,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '700',
  },
  disclaimerWrapper: {
    marginTop: Spacing.xl,
  },
});
