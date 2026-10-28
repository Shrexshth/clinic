import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Pressable,
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';
import { Colors, Radii, Shadows, Spacing, SpacingKey } from '../theme';

export interface AppCardProps {
  children: ReactNode;
  padding?: SpacingKey;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
}

/**
 * AppCard: White surface, 24px radius, soft elevation shadow.
 * Uses strict theme tokens. Supports optional Material ripple on press.
 */
export function AppCard({
  children,
  padding = 'lg',
  onPress,
  style,
  accessibilityRole,
  accessibilityLabel,
  accessibilityState,
}: AppCardProps) {
  const cardStyle = [
    styles.card,
    {
      padding: Spacing[padding],
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        android_ripple={{ color: Colors.ripple, borderless: false }}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={cardStyle}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.cards,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.soft,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
  },
});
