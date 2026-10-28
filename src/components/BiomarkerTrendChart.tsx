// ============================================================================
// src/components/BiomarkerTrendChart.tsx
//
// Interactive historical trend chart for laboratory blood biomarkers.
// Features:
// - Shaded reference band (optimalMin to optimalMax)
// - Trajectory calculation with "improved / worsened / stable" badge
// - Clean SVG visualization with data points, reference limits, and timestamps
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Rect,
  Path,
  Circle,
  Text as SvgText,
  Line,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';

export type TrajectoryStatus = 'improved' | 'worsened' | 'stable';

export interface TrendDataPoint {
  value: number;
  label: string; // e.g. "Oct 23"
  date?: string;
}

export interface BiomarkerTrendChartProps {
  biomarkerName: string;
  unit: string;
  optimalMin: number;
  optimalMax: number;
  minRange?: number;
  maxRange?: number;
  history: TrendDataPoint[];
  width?: number;
  height?: number;
}

/**
 * Calculates whether the biomarker's trajectory has improved, worsened, or remained stable.
 */
export function computeTrajectory(
  history: TrendDataPoint[],
  optimalMin: number,
  optimalMax: number
): {
  status: TrajectoryStatus;
  label: string;
  summary: string;
  delta: number;
} {
  if (!history || history.length < 2) {
    return {
      status: 'stable',
      label: 'STABLE',
      summary: 'Baseline established. Repeat test to calculate ongoing trajectory.',
      delta: 0,
    };
  }

  const latest = history[history.length - 1].value;
  const previous = history[history.length - 2].value;
  const delta = latest - previous;
  const rangeSpan = Math.max(1, optimalMax - optimalMin);

  // Calculate distance from healthy reference range
  const calcDistanceFromRange = (val: number): number => {
    if (val < optimalMin) return optimalMin - val;
    if (val > optimalMax) return val - optimalMax;
    return 0; // Inside optimal range
  };

  const distPrev = calcDistanceFromRange(previous);
  const distLatest = calcDistanceFromRange(latest);

  // Both already in optimal range
  if (distPrev === 0 && distLatest === 0) {
    return {
      status: 'stable',
      label: 'STABLE',
      summary: 'Consistently maintaining healthy values within optimal reference limits.',
      delta,
    };
  }

  // Moved closer to optimal range
  const improvement = distPrev - distLatest;
  const threshold = rangeSpan * 0.03; // 3% margin of significance

  if (improvement > threshold) {
    return {
      status: 'improved',
      label: 'IMPROVED',
      summary: `Trajectory moving closer to target reference range (${optimalMin}–${optimalMax}).`,
      delta,
    };
  }

  // Moved further away from optimal range
  if (improvement < -threshold) {
    return {
      status: 'worsened',
      label: 'WORSENED',
      summary: `Trajectory shifted further away from healthy reference range.`,
      delta,
    };
  }

  return {
    status: 'stable',
    label: 'STABLE',
    summary: 'Minimal change compared to previous laboratory testing.',
    delta,
  };
}

export function BiomarkerTrendChart({
  biomarkerName,
  unit,
  optimalMin,
  optimalMax,
  history,
  width: customWidth,
  height = 220,
}: BiomarkerTrendChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = customWidth || Math.min(360, screenWidth - Spacing.lg * 2 - Spacing.md * 2);

  const trajectory = computeTrajectory(history, optimalMin, optimalMax);

  if (!history || history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No historical laboratory records available.</Text>
      </View>
    );
  }

  // Chart dimensions & layout
  const padLeft = 40;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 32;

  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Determine vertical scale bounds
  const values = history.map((h) => h.value);
  const rawMin = Math.min(...values, optimalMin);
  const rawMax = Math.max(...values, optimalMax);
  const span = Math.max(1, rawMax - rawMin);

  const minY = Math.floor(rawMin - span * 0.15);
  const maxY = Math.ceil(rawMax + span * 0.2);
  const totalYSpan = Math.max(1, maxY - minY);

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return padTop + ((maxY - clamped) / totalYSpan) * plotHeight;
  };

  const getX = (index: number) => {
    if (history.length === 1) return padLeft + plotWidth / 2;
    return padLeft + (index / (history.length - 1)) * plotWidth;
  };

  // Reference band coordinates
  const bandTopY = getY(Math.min(maxY, optimalMax));
  const bandBottomY = getY(Math.max(minY, optimalMin));
  const bandHeight = Math.max(4, bandBottomY - bandTopY);

  // Build SVG path
  let pathD = '';
  let areaD = '';

  history.forEach((pt, i) => {
    const x = getX(i);
    const y = getY(pt.value);
    if (i === 0) {
      pathD += `M ${x} ${y}`;
      areaD += `M ${x} ${padTop + plotHeight} L ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
      areaD += ` L ${x} ${y}`;
    }
  });

  const lastX = getX(history.length - 1);
  const firstX = getX(0);
  areaD += ` L ${lastX} ${padTop + plotHeight} L ${firstX} ${padTop + plotHeight} Z`;

  // Status colors & icons
  const badgeConfig = {
    improved: {
      bg: Colors.statusNormalBg,
      text: Colors.statusNormal,
      border: 'rgba(31, 157, 97, 0.3)',
      Icon: TrendingUp,
    },
    worsened: {
      bg: Colors.statusAbnormalBg,
      text: Colors.statusAbnormal,
      border: 'rgba(229, 83, 61, 0.3)',
      Icon: TrendingDown,
    },
    stable: {
      bg: Colors.statusBorderlineBg,
      text: Colors.statusBorderline,
      border: 'rgba(224, 161, 0, 0.3)',
      Icon: Minus,
    },
  }[trajectory.status];

  const BadgeIcon = badgeConfig.Icon;

  return (
    <View style={styles.container}>
      {/* Trajectory Header Card */}
      <View style={styles.trajectoryHeaderRow}>
        <View style={styles.nameCategoryCol}>
          <Text style={styles.chartTitle}>{biomarkerName} Trend</Text>
          <Text style={styles.chartSubtitle}>
            Target: {optimalMin} – {optimalMax} {unit}
          </Text>
        </View>

        {/* Trajectory Badge: Improved / Worsened / Stable */}
        <View
          style={[
            styles.trajectoryBadge,
            { backgroundColor: badgeConfig.bg, borderColor: badgeConfig.border },
          ]}
        >
          <BadgeIcon size={14} color={badgeConfig.text} strokeWidth={2.6} />
          <Text style={[styles.trajectoryBadgeText, { color: badgeConfig.text }]}>
            {trajectory.label}
          </Text>
        </View>
      </View>

      {/* Trajectory Clinical Rationale Summary */}
      <Text style={styles.trajectorySummaryText}>{trajectory.summary}</Text>

      {/* SVG Trend Chart */}
      <View style={styles.svgWrapper}>
        <Svg width={chartWidth} height={height}>
          <Defs>
            <LinearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.25} />
              <Stop offset="100%" stopColor={Colors.background} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>

          {/* 1. Shaded Reference Band (Optimal Range) */}
          <Rect
            x={padLeft}
            y={bandTopY}
            width={plotWidth}
            height={bandHeight}
            fill="rgba(31, 157, 97, 0.12)"
            stroke="rgba(31, 157, 97, 0.45)"
            strokeWidth={1}
            strokeDasharray="4,4"
            rx={4}
          />

          {/* Reference Line Labels */}
          <SvgText
            x={padLeft + 6}
            y={bandTopY + 12}
            fontSize="9"
            fontWeight="700"
            fill={Colors.statusNormal}
          >
            Optimal Upper ({optimalMax})
          </SvgText>

          <SvgText
            x={padLeft + 6}
            y={bandBottomY - 4}
            fontSize="9"
            fontWeight="700"
            fill={Colors.statusNormal}
          >
            Optimal Lower ({optimalMin})
          </SvgText>

          {/* 2. Grid lines for context */}
          <Line
            x1={padLeft}
            y1={padTop + plotHeight}
            x2={padLeft + plotWidth}
            y2={padTop + plotHeight}
            stroke={Colors.borderLight}
            strokeWidth={1}
          />

          {/* 3. Trend Line Fill Area */}
          <Path d={areaD} fill="url(#trendGradient)" />

          {/* 4. Main Trend Line */}
          <Path
            d={pathD}
            fill="none"
            stroke={Colors.primary}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 5. Data Points & Value Badges */}
          {history.map((pt, idx) => {
            const cx = getX(idx);
            const cy = getY(pt.value);
            const isLatest = idx === history.length - 1;

            return (
              <React.Fragment key={idx}>
                {/* Data point dot */}
                <Circle
                  cx={cx}
                  cy={cy}
                  r={isLatest ? 6.5 : 5}
                  fill={isLatest ? Colors.primary : Colors.white}
                  stroke={Colors.deepMaroon}
                  strokeWidth={isLatest ? 2.5 : 2}
                />

                {/* Value text above dot */}
                <SvgText
                  x={cx}
                  y={cy - 10}
                  fontSize="11"
                  fontWeight={isLatest ? '800' : '600'}
                  fill={isLatest ? Colors.primary : Colors.text}
                  textAnchor="middle"
                >
                  {pt.value}
                </SvgText>

                {/* X-axis date label below point */}
                <SvgText
                  x={cx}
                  y={padTop + plotHeight + 16}
                  fontSize="10"
                  fontWeight="600"
                  fill={isLatest ? Colors.deepMaroon : Colors.secondaryText}
                  textAnchor="middle"
                >
                  {pt.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Shaded Reference Band Legend Footer */}
      <View style={styles.legendFooter}>
        <View style={styles.legendColorBox} />
        <Text style={styles.legendFooterText}>
          Shaded Green Band indicates clinical target reference zone ({optimalMin}–{optimalMax} {unit})
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Radii.cards,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  trajectoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  nameCategoryCol: {
    flex: 1,
  },
  chartTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  chartSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    marginTop: 1,
  },
  trajectoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.pills,
    borderWidth: 1,
    gap: 4,
  },
  trajectoryBadgeText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  trajectorySummaryText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
  },
  legendFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  legendColorBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: 'rgba(31, 157, 97, 0.25)',
    borderWidth: 1,
    borderColor: Colors.statusNormal,
    marginRight: Spacing.xs,
  },
  legendFooterText: {
    flex: 1,
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
  },
  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
  },
});
