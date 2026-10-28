import React, { ReactNode } from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { Colors, Radii, Shadows, Spacing, Typography } from '../theme';
import { MaterialRipple } from './MaterialRipple';

export interface MaterialButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tonal' | 'outlined' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function MaterialButton({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  style,
}: MaterialButtonProps) {
  let containerStyle: ViewStyle = {};
  let textStyle: TextStyle = {};
  let rippleColor: string = Colors.ripple;

  switch (variant) {
    case 'secondary':
      containerStyle = {
        backgroundColor: Colors.deepMaroon,
        ...Shadows.soft,
      };
      textStyle = { color: Colors.white };
      rippleColor = Colors.rippleLight;
      break;
    case 'tonal':
      containerStyle = {
        backgroundColor: Colors.redTint,
      };
      textStyle = { color: Colors.deepMaroon };
      rippleColor = Colors.ripple;
      break;
    case 'outlined':
      containerStyle = {
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.border,
      };
      textStyle = { color: Colors.text };
      rippleColor = Colors.ripple;
      break;
    case 'danger':
      containerStyle = {
        backgroundColor: Colors.statusAbnormal,
        ...Shadows.soft,
      };
      textStyle = { color: Colors.white };
      rippleColor = Colors.rippleLight;
      break;
    case 'ghost':
      containerStyle = {
        backgroundColor: 'transparent',
      };
      textStyle = { color: Colors.primary };
      rippleColor = Colors.ripple;
      break;
    case 'primary':
    default:
      containerStyle = {
        backgroundColor: Colors.primary,
        ...Shadows.soft,
      };
      textStyle = { color: Colors.white };
      rippleColor = Colors.rippleLight;
      break;
  }

  let paddingVertical: number = Spacing.sm;
  let paddingHorizontal: number = Spacing.lg;
  let fontConf: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    fontWeight: TextStyle['fontWeight'];
  } = Typography.bodyBold;

  if (size === 'small') {
    paddingVertical = Spacing.xs + 2;
    paddingHorizontal = Spacing.md;
    fontConf = Typography.smallBold;
  } else if (size === 'large') {
    paddingVertical = Spacing.md;
    paddingHorizontal = Spacing.xxl;
    fontConf = Typography.bodyLarge;
  }

  return (
    <MaterialRipple
      onPress={onPress}
      disabled={disabled}
      rippleColor={rippleColor}
      style={[
        styles.buttonBase,
        containerStyle,
        {
          paddingVertical,
          paddingHorizontal,
          borderRadius: Radii.pills,
        },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          style={[
            styles.labelText,
            textStyle,
            {
              fontFamily: fontConf.fontFamily,
              fontSize: fontConf.fontSize,
              lineHeight: fontConf.lineHeight,
              fontWeight: fontConf.fontWeight,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </MaterialRipple>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    textAlign: 'center',
  },
});
