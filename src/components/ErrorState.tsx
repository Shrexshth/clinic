import React from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { triggerMediumHaptic } from '@/utils/haptics';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = 'Something Went Wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  style,
}: ErrorStateProps) {
  const handleRetry = () => {
    triggerMediumHaptic();
    onRetry?.();
  };

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`${title}: ${message}`}
    >
      <View style={styles.iconCircle}>
        <AlertCircle size={32} color={Colors.statusAbnormal} strokeWidth={2.2} />
      </View>

      <Text
        maxFontSizeMultiplier={1.4}
        style={styles.title}
        accessibilityRole="header"
      >
        {title}
      </Text>

      <Text maxFontSizeMultiplier={1.4} style={styles.message}>
        {message}
      </Text>

      {onRetry && (
        <Pressable
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          android_ripple={{ color: Colors.rippleLight, borderless: false }}
          style={styles.retryButton}
        >
          <RefreshCw size={16} color={Colors.white} strokeWidth={2.4} style={{ marginRight: 8 }} />
          <Text maxFontSizeMultiplier={1.4} style={styles.retryText}>
            {retryLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF5F5',
    borderRadius: Radii.cards,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FED7D7',
    marginVertical: Spacing.md,
    ...Shadows.card,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.subtitle.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: '#7F1D1D',
    textAlign: 'center',
    maxWidth: 290,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.pills,
  },
  retryText: {
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
