import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { Colors, Radii, Spacing, Typography } from '../theme';

export interface MedicalDisclaimerProps {
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Mandatory clinical disclaimer component.
 * Stated rule: "Every health screen shows 'Informational only, not medical advice.'"
 */
export function MedicalDisclaimer({
  compact = false,
  style,
}: MedicalDisclaimerProps) {
  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <ShieldCheck size={14} color={Colors.deepMaroon} strokeWidth={2.4} />
        <Text style={styles.compactText}>
          Informational only, not medical advice.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.fullContainer, style]}>
      <View style={styles.headerRow}>
        <ShieldCheck size={18} color={Colors.primary} strokeWidth={2.4} />
        <Text style={styles.title}>
          Informational only, not medical advice.
        </Text>
      </View>
      <Text style={styles.body}>
        ClinixBridge analyses and dietary suggestions are designed for nutritional education and reference ranges from deterministic laboratory standards. Always consult a qualified physician or hematologist before making medical changes.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.redTint,
    borderRadius: Radii.pills,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  compactText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    fontWeight: '600',
    marginLeft: Spacing.xs,
    textAlign: 'center',
  },
  fullContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: Colors.deepMaroon,
    fontFamily: Typography.smallBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    lineHeight: Typography.smallBold.lineHeight,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  body: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginTop: Spacing.xs,
  },
});
