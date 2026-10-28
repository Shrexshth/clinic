import React from 'react';
import { StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { ArrowRight, ArrowLeft, ArrowUpRight } from 'lucide-react-native';
import { Colors, Radii, Shadows, Spacing } from '../theme';

export interface CircleArrowButtonProps {
  onPress: () => void;
  direction?: 'right' | 'left' | 'up-right';
  size?: number;
  arrowColor?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * CircleArrowButton: White circular action button containing an arrow icon.
 * Includes soft shadow and Material-style ripple feedback.
 */
import { triggerLightHaptic } from '@/utils/haptics';

export function CircleArrowButton({
  onPress,
  direction = 'right',
  size = 44,
  arrowColor = Colors.deepMaroon,
  backgroundColor = Colors.white,
  style,
}: CircleArrowButtonProps) {
  const iconSize = Math.round(size * 0.45);

  const handlePress = () => {
    triggerLightHaptic();
    onPress();
  };

  const renderArrow = () => {
    switch (direction) {
      case 'left':
        return <ArrowLeft size={iconSize} color={arrowColor} strokeWidth={2.5} />;
      case 'up-right':
        return <ArrowUpRight size={iconSize} color={arrowColor} strokeWidth={2.5} />;
      case 'right':
      default:
        return <ArrowRight size={iconSize} color={arrowColor} strokeWidth={2.5} />;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Navigate ${direction}`}
      android_ripple={{ color: Colors.ripple, borderless: true }}
      style={({ pressed }) => [
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: Radii.pills,
          backgroundColor,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      {renderArrow()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.soft,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
