import React, { ReactNode } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  View,
} from 'react-native';
import { Colors, Radii, Spacing, Typography } from '../theme';

export interface PillChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * PillChip: Pill-shaped toggle chip.
 * Selected = Deep Maroon (#6E0B14) fill with white text.
 * Unselected = White (#FFFFFF) with border (#E8DCDE) and dark text.
 * Includes Android ripple feedback.
 */
import { triggerLightHaptic } from '@/utils/haptics';

export function PillChip({
  label,
  selected = false,
  onPress,
  icon,
  style,
}: PillChipProps) {
  const handlePress = () => {
    triggerLightHaptic();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      android_ripple={{
        color: selected ? Colors.rippleLight : Colors.ripple,
        borderless: false,
      }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          maxFontSizeMultiplier={1.4}
          style={[
            styles.label,
            selected ? styles.selectedLabel : styles.unselectedLabel,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radii.pills,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selectedChip: {
    backgroundColor: Colors.deepMaroon,
    borderWidth: 1,
    borderColor: Colors.deepMaroon,
  },
  unselectedChip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.88,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.xs,
  },
  label: {
    fontFamily: Typography.smallBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    lineHeight: Typography.smallBold.lineHeight,
    fontWeight: Typography.smallBold.fontWeight,
  },
  selectedLabel: {
    color: Colors.white,
  },
  unselectedLabel: {
    color: Colors.text,
  },
});
