import React from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { FileQuestion, LucideIcon } from 'lucide-react-native';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { triggerLightHaptic } from '@/utils/haptics';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileQuestion,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}: EmptyStateProps) {
  const handleAction = () => {
    triggerLightHaptic();
    onAction?.();
  };

  const handleSecondaryAction = () => {
    triggerLightHaptic();
    onSecondaryAction?.();
  };

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${description}`}
    >
      <View style={styles.iconCircle}>
        <Icon size={32} color={Colors.primary} strokeWidth={2} />
      </View>

      <Text
        maxFontSizeMultiplier={1.4}
        style={styles.title}
        accessibilityRole="header"
      >
        {title}
      </Text>

      <Text maxFontSizeMultiplier={1.4} style={styles.description}>
        {description}
      </Text>

      {actionLabel && onAction && (
        <Pressable
          onPress={handleAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          android_ripple={{ color: Colors.rippleLight, borderless: false }}
          style={styles.actionButton}
        >
          <Text maxFontSizeMultiplier={1.4} style={styles.actionText}>
            {actionLabel}
          </Text>
        </Pressable>
      )}

      {secondaryActionLabel && onSecondaryAction && (
        <Pressable
          onPress={handleSecondaryAction}
          accessibilityRole="button"
          accessibilityLabel={secondaryActionLabel}
          android_ripple={{ color: Colors.ripple, borderless: false }}
          style={styles.secondaryButton}
        >
          <Text maxFontSizeMultiplier={1.4} style={styles.secondaryText}>
            {secondaryActionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Radii.cards,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
    ...Shadows.card,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.redTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.subtitle.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.secondaryText,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.pills,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  secondaryText: {
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.deepMaroon,
    textDecorationLine: 'underline',
  },
});
