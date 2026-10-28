import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { CheckCircle2, AlertTriangle, AlertCircle, LucideIcon } from 'lucide-react-native';
import { Colors, Radii, Spacing, Typography } from '../theme';

export type StatusType = 'normal' | 'borderline' | 'abnormal';

export interface StatusChipProps {
  status: StatusType;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

interface ChipConfig {
  bg: string;
  color: string;
  defaultLabel: string;
  icon: LucideIcon;
}

/**
 * StatusChip: Icon + text label pair for biomarker state.
 * Strictly adheres to clinical accessibility guideline: NEVER color alone.
 * - normal: CheckCircle2 icon + #1F9D61 text
 * - borderline: AlertTriangle icon + #E0A100 text
 * - abnormal: AlertCircle icon + #E5533D text
 */
export function StatusChip({ status, label, style }: StatusChipProps) {
  let config: ChipConfig = {
    bg: Colors.statusNormalBg,
    color: Colors.statusNormal,
    defaultLabel: 'Normal',
    icon: CheckCircle2,
  };

  if (status === 'borderline') {
    config = {
      bg: Colors.statusBorderlineBg,
      color: Colors.statusBorderline,
      defaultLabel: 'Borderline',
      icon: AlertTriangle,
    };
  } else if (status === 'abnormal') {
    config = {
      bg: Colors.statusAbnormalBg,
      color: Colors.statusAbnormal,
      defaultLabel: 'Abnormal',
      icon: AlertCircle,
    };
  }

  const IconComponent = config.icon;
  const displayLabel = label ?? config.defaultLabel;

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: config.bg,
        },
        style,
      ]}
    >
      <IconComponent size={14} color={config.color} strokeWidth={2.4} />
      <Text
        style={[
          styles.text,
          {
            color: config.color,
          },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radii.pills,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Typography.smallBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    lineHeight: Typography.smallBold.lineHeight,
    fontWeight: Typography.smallBold.fontWeight,
    marginLeft: Spacing.xs,
  },
});
