import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';

export interface SectionHeaderProps {
  /** Leading or primary part of headline in dark text */
  text: string;
  /** Highlighted word or phrase rendered in crimson (#B3141F) */
  highlightWord: string;
  /** Optional secondary text following the highlight */
  suffix?: string;
  /** Optional subtitle below the headline */
  subtitle?: string;
  /** Optional action or button on the right */
  rightAction?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * SectionHeader: Two-tone headline component where one key word is rendered
 * in crimson (#B3141F) and the surrounding text in dark tone (#1E1416).
 */
export function SectionHeader({
  text,
  highlightWord,
  suffix = '',
  subtitle,
  rightAction,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textColumn}>
        <Text style={styles.headline}>
          <Text style={styles.baseText}>{text} </Text>
          <Text style={styles.crimsonText}>{highlightWord}</Text>
          {suffix ? <Text style={styles.baseText}> {suffix}</Text> : null}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  textColumn: {
    flex: 1,
  },
  headline: {
    fontFamily: Typography.title.fontFamily,
    fontSize: Typography.title.fontSize,
    lineHeight: Typography.title.lineHeight,
    fontWeight: Typography.title.fontWeight,
  },
  baseText: {
    color: Colors.text,
  },
  crimsonText: {
    color: Colors.primary,
  },
  subtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.small.fontFamily,
    fontSize: Typography.small.fontSize,
    lineHeight: Typography.small.lineHeight,
    fontWeight: Typography.small.fontWeight,
    marginTop: Spacing.xs / 2,
  },
  rightAction: {
    marginLeft: Spacing.md,
  },
});
