import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing, Typography } from '../theme';
import { BiomarkerEvaluation } from '../features/analyzer/types/biomarker';
import { StatusChip, StatusType } from './StatusChip';

export interface BiomarkerGaugeProps {
  evaluation: BiomarkerEvaluation;
  showDetails?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BiomarkerGauge({
  evaluation,
  showDetails = true,
  style,
}: BiomarkerGaugeProps) {
  const { rule, value, status, statusLabel, normalizedPosition, deviationMessage } = evaluation;

  const getStatusType = (): StatusType => {
    if (status === 'optimal') return 'normal';
    if (status.includes('borderline')) return 'borderline';
    return 'abnormal';
  };

  const pointerPercent = Math.max(4, Math.min(96, Math.round(normalizedPosition * 100)));

  return (
    <View style={[styles.container, style]}>
      {/* Top Header Row: Name & Value/Badge */}
      <View style={styles.headerRow}>
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{rule.name}</Text>
          <Text style={styles.categoryText}>{rule.category}</Text>
        </View>

        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>
            {value} <Text style={styles.unitText}>{rule.unit}</Text>
          </Text>
          <StatusChip status={getStatusType()} label={statusLabel} style={{ marginTop: Spacing.xs }} />
        </View>
      </View>

      {/* Visual Multi-Zone Range Bar */}
      <View style={styles.gaugeTrackWrapper}>
        <View style={styles.gaugeTrack}>
          {/* Low Zone */}
          <View style={[styles.zoneSegment, { backgroundColor: Colors.statusAbnormal, flex: 1 }]} />
          {/* Optimal Zone */}
          <View style={[styles.zoneSegment, { backgroundColor: Colors.statusNormal, flex: 2 }]} />
          {/* High Zone */}
          <View style={[styles.zoneSegment, { backgroundColor: Colors.statusBorderline, flex: 1.2 }]} />
        </View>

        {/* Dynamic Position Pointer */}
        <View style={[styles.pointerContainer, { left: `${pointerPercent}%` }]}>
          <View style={styles.pointerDiamond} />
        </View>
      </View>

      {/* Reference Range Boundaries */}
      <View style={styles.rangeLabelsRow}>
        <Text style={styles.rangeLabelText}>Low (&lt;{rule.ranges.low})</Text>
        <Text style={[styles.rangeLabelText, styles.rangeOptimalText]}>
          Optimal: {rule.ranges.optimalMin} - {rule.ranges.optimalMax} {rule.unit}
        </Text>
        <Text style={styles.rangeLabelText}>High (&gt;{rule.ranges.high})</Text>
      </View>

      {/* Status Note */}
      {showDetails && (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsText}>{deviationMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  nameText: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    lineHeight: Typography.bodyBold.lineHeight,
    fontWeight: '700',
  },
  categoryText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginTop: 2,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueText: {
    color: Colors.text,
    fontFamily: Typography.title.fontFamily,
    fontSize: Typography.title.fontSize,
    lineHeight: Typography.title.lineHeight,
    fontWeight: '800',
  },
  unitText: {
    color: Colors.secondaryText,
    fontFamily: Typography.small.fontFamily,
    fontSize: Typography.small.fontSize,
    fontWeight: '400',
  },
  gaugeTrackWrapper: {
    position: 'relative',
    height: 18,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  gaugeTrack: {
    height: 8,
    width: '100%',
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: Radii.pills,
  },
  zoneSegment: {
    height: '100%',
  },
  pointerContainer: {
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
    marginTop: Spacing.xs,
  },
  rangeLabelText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
  },
  rangeOptimalText: {
    color: Colors.statusNormal,
    fontWeight: '700',
  },
  detailsBox: {
    backgroundColor: Colors.redTint,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  detailsText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
  },
});
