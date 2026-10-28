import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radii, Shadows, Spacing, SpacingKey } from '../theme';

export interface MaterialCardProps {
  children: ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: SpacingKey;
  style?: StyleProp<ViewStyle>;
}

export function MaterialCard({
  children,
  variant = 'elevated',
  padding = 'lg',
  style,
}: MaterialCardProps) {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: Colors.card,
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: Radii.cards,
        };
      case 'filled':
        return {
          backgroundColor: Colors.redTint,
          borderRadius: Radii.cards,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: Colors.card,
          borderRadius: Radii.cards,
          borderWidth: 1,
          borderColor: Colors.borderLight,
          ...Shadows.soft,
        };
    }
  };

  return (
    <View
      style={[
        styles.base,
        getVariantStyle(),
        { padding: Spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
