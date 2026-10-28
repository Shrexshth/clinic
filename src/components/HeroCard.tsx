import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii, Shadows, Spacing, Typography } from '../theme';

export interface HeroCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  rightAction?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * HeroCard: Crimson (#B3141F) to Maroon (#6E0B14) gradient card with white typography.
 * Implemented with expo-linear-gradient and theme tokens.
 */
export function HeroCard({
  title,
  subtitle,
  badge,
  rightAction,
  children,
  style,
}: HeroCardProps) {
  return (
    <LinearGradient
      colors={[Colors.primary, Colors.deepMaroon]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {(badge || rightAction) && (
        <View style={styles.topRow}>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : (
            <View />
          )}
          {rightAction}
        </View>
      )}

      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {children && <View style={styles.childrenContainer}>{children}</View>}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radii.cards,
    padding: Spacing.xl,
    ...Shadows.card,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pills,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: Colors.white,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    fontWeight: Typography.caption.fontWeight,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.white,
    fontFamily: Typography.title.fontFamily,
    fontSize: Typography.title.fontSize,
    lineHeight: Typography.title.lineHeight,
    fontWeight: Typography.title.fontWeight,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: Typography.body.fontWeight,
  },
  childrenContainer: {
    marginTop: Spacing.md,
  },
});
