import React, { useEffect } from 'react';
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
  X,
  Salad,
  Stethoscope,
  Info,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { Biomarker } from '@/data/mock';
import { StatusChip } from './StatusChip';
import { CircleArrowButton } from './CircleArrowButton';
import { MedicalDisclaimer } from './MedicalDisclaimer';
import { BiomarkerTrendChart } from './BiomarkerTrendChart';

export interface BiomarkerDetailModalProps {
  biomarker: Biomarker | null;
  visible: boolean;
  onClose: () => void;
}

export function BiomarkerDetailModal({
  biomarker,
  visible,
  onClose,
}: BiomarkerDetailModalProps) {
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  if (!biomarker) return null;

  // Calculate pointer position along range bar
  const rangeSpan = biomarker.maxRange - biomarker.minRange;
  const clampedVal = Math.max(biomarker.minRange, Math.min(biomarker.maxRange, biomarker.value));
  const pointerPercent = Math.max(4, Math.min(96, Math.round(((clampedVal - biomarker.minRange) / rangeSpan) * 100)));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <CircleArrowButton direction="left" onPress={onClose} size={38} />
          <View style={styles.topBarTitles}>
            <Text style={styles.topBarCategory}>{biomarker.category.toUpperCase()}</Text>
            <Text style={styles.topBarName} numberOfLines={1}>{biomarker.name}</Text>
          </View>
          <Pressable
            onPress={onClose}
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
          {/* 1. Big Value & Status Banner */}
          <View style={styles.valueCard}>
            <Text style={styles.bigValue}>
              {biomarker.value} <Text style={styles.bigUnit}>{biomarker.unit}</Text>
            </Text>
            <View style={styles.statusRow}>
              <StatusChip status={biomarker.status} label={biomarker.statusLabel} />
              <Text style={styles.optimalNote}>
                Target: {biomarker.optimalMin} - {biomarker.optimalMax} {biomarker.unit}
              </Text>
            </View>

            {/* Range Bar with Marker */}
            <View style={styles.gaugeContainer}>
              <View style={styles.gaugeTrack}>
                <View style={[styles.gaugeSegment, { backgroundColor: Colors.statusAbnormal, flex: 1 }]} />
                <View style={[styles.gaugeSegment, { backgroundColor: Colors.statusNormal, flex: 2 }]} />
                <View style={[styles.gaugeSegment, { backgroundColor: Colors.statusBorderline, flex: 1.2 }]} />
              </View>

              <View style={[styles.gaugePointer, { left: `${pointerPercent}%` }]}>
                <View style={styles.pointerDiamond} />
              </View>
            </View>

            <View style={styles.gaugeLabels}>
              <Text style={styles.rangeSubText}>Low (&lt;{biomarker.minRange})</Text>
              <Text style={[styles.rangeSubText, { color: Colors.statusNormal, fontWeight: '700' }]}>
                Optimal Zone
              </Text>
              <Text style={styles.rangeSubText}>High (&gt;{biomarker.maxRange})</Text>
            </View>
          </View>

          {/* 2. What it is */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconBadge}>
                <Info size={18} color={Colors.deepMaroon} strokeWidth={2.4} />
              </View>
              <Text style={styles.sectionTitle}>What it is</Text>
            </View>
            <Text style={styles.sectionBodyText}>{biomarker.whatItIs}</Text>
          </View>

          {/* 3. Why it may be low/high */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: Colors.statusBorderlineBg }]}>
                <AlertTriangle size={18} color={Colors.statusBorderline} strokeWidth={2.4} />
              </View>
              <Text style={styles.sectionTitle}>Why it may be low / high</Text>
            </View>
            <Text style={styles.sectionBodyText}>{biomarker.whyLowOrHigh}</Text>
          </View>

          {/* 4. Foods that help */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: Colors.statusNormalBg }]}>
                <Salad size={18} color={Colors.statusNormal} strokeWidth={2.4} />
              </View>
              <Text style={styles.sectionTitle}>Foods that help</Text>
            </View>
            <View style={styles.foodList}>
              {biomarker.foodsThatHelp.map((food, idx) => (
                <View key={idx} style={styles.foodItemRow}>
                  <View style={styles.foodBullet} />
                  <Text style={styles.foodText}>{food}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 5. When to see a doctor */}
          <View style={[styles.sectionCard, styles.doctorCard]}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: Colors.redTint }]}>
                <Stethoscope size={18} color={Colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={[styles.sectionTitle, { color: Colors.deepMaroon }]}>When to see a doctor</Text>
            </View>
            <Text style={[styles.sectionBodyText, { color: Colors.deepMaroon }]}>
              {biomarker.whenToSeeDoctor}
            </Text>
          </View>

          {/* 6. Historical Trend Chart with Shaded Reference Band & Trajectory */}
          <View style={{ marginBottom: Spacing.lg }}>
            <BiomarkerTrendChart
              biomarkerName={biomarker.name}
              unit={biomarker.unit}
              optimalMin={biomarker.optimalMin}
              optimalMax={biomarker.optimalMax}
              minRange={biomarker.minRange}
              maxRange={biomarker.maxRange}
              history={
                biomarker.progressChartData && biomarker.progressChartData.length > 0
                  ? biomarker.progressChartData
                  : biomarker.previousTimeline.map((t) => ({ value: t.value, label: t.date }))
              }
            />
          </View>

          {/* 7. Previous Values Timeline */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconBadge}>
                <Calendar size={18} color={Colors.deepMaroon} strokeWidth={2.4} />
              </View>
              <Text style={styles.sectionTitle}>Previous Values Timeline</Text>
            </View>

            <View style={styles.timelineList}>
              {biomarker.previousTimeline.map((item, idx) => {
                const isLatest = idx === biomarker.previousTimeline.length - 1;

                return (
                  <View key={idx} style={styles.timelineRow}>
                    <View style={styles.timelineNodeColumn}>
                      <View
                        style={[
                          styles.timelineNode,
                          isLatest ? styles.timelineNodeActive : styles.timelineNodeInactive,
                        ]}
                      />
                      {idx < biomarker.previousTimeline.length - 1 && <View style={styles.timelineLine} />}
                    </View>

                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineDate}>{item.date}</Text>
                      <Text style={[styles.timelineValue, isLatest && { color: Colors.primary }]}>
                        {item.value} {biomarker.unit} {isLatest && '(Current)'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Medical Disclaimer Banner */}
          <View style={styles.disclaimerWrapper}>
            <MedicalDisclaimer />
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.soft,
  },
  topBarTitles: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  topBarCategory: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    letterSpacing: 1,
    fontWeight: '700',
  },
  topBarName: {
    color: Colors.text,
    fontFamily: Typography.title.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    lineHeight: Typography.bodyLarge.lineHeight,
    fontWeight: '700',
  },
  closeIconButton: {
    padding: Spacing.xs,
    borderRadius: Radii.pills,
    backgroundColor: Colors.borderLight,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  valueCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.cards,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
    marginBottom: Spacing.lg,
  },
  bigValue: {
    color: Colors.text,
    fontFamily: Typography.display.fontFamily,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
  },
  bigUnit: {
    color: Colors.secondaryText,
    fontFamily: Typography.subtitle.fontFamily,
    fontSize: Typography.subtitle.fontSize,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  optimalNote: {
    color: Colors.secondaryText,
    fontFamily: Typography.small.fontFamily,
    fontSize: Typography.small.fontSize,
  },
  gaugeContainer: {
    position: 'relative',
    height: 22,
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  gaugeTrack: {
    height: 10,
    width: '100%',
    flexDirection: 'row',
    borderRadius: Radii.pills,
    overflow: 'hidden',
  },
  gaugeSegment: {
    height: '100%',
  },
  gaugePointer: {
    position: 'absolute',
    top: 2,
    marginLeft: -8,
    alignItems: 'center',
  },
  pointerDiamond: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    backgroundColor: Colors.dark,
    borderColor: Colors.card,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  rangeSubText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.cards,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.soft,
    marginBottom: Spacing.md,
  },
  doctorCard: {
    backgroundColor: Colors.redTint,
    borderColor: Colors.primary,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    backgroundColor: Colors.redTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    lineHeight: Typography.bodyLarge.lineHeight,
    fontWeight: '700',
  },
  sectionBodyText: {
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
  foodList: {
    gap: Spacing.sm,
  },
  foodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.statusNormal,
    marginRight: Spacing.sm,
  },
  foodText: {
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
  timelineList: {
    marginTop: Spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 46,
  },
  timelineNodeColumn: {
    width: 20,
    alignItems: 'center',
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineNodeActive: {
    backgroundColor: Colors.primary,
  },
  timelineNodeInactive: {
    backgroundColor: Colors.border,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginLeft: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  timelineDate: {
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
  },
  timelineValue: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '700',
  },
  disclaimerWrapper: {
    marginTop: Spacing.lg,
  },
});
