import React, { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../theme';

export interface MaterialRippleProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  rippleColor?: string;
  borderless?: boolean;
  activeOpacity?: number;
}

/**
 * Cross-platform touchable component.
 * On Android: produces native Material ripple feedback.
 * On iOS: produces clean smooth opacity feedback.
 */
export function MaterialRipple({
  children,
  style,
  rippleColor,
  borderless = false,
  activeOpacity = 0.72,
  disabled,
  ...rest
}: MaterialRippleProps) {
  const effectiveRipple = rippleColor ?? Colors.ripple;

  return (
    <Pressable
      android_ripple={
        disabled
          ? undefined
          : {
              color: effectiveRipple,
              borderless,
              foreground: Platform.OS === 'android' && Platform.Version >= 23,
            }
      }
      style={({ pressed }) => [
        style,
        Platform.OS === 'ios' && pressed && !disabled && { opacity: activeOpacity },
        disabled && { opacity: 0.5 },
      ]}
      disabled={disabled}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
