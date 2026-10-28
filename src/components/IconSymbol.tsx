import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../theme';

export type IconName =
  | 'home'
  | 'flask'
  | 'nutrition'
  | 'plus'
  | 'profile'
  | 'check'
  | 'alert'
  | 'info'
  | 'arrowBack'
  | 'chevronRight'
  | 'chevronDown'
  | 'heart'
  | 'shield'
  | 'doctor'
  | 'filter'
  | 'search'
  | 'sparkles'
  | 'arrowUp'
  | 'arrowDown';

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconSymbol({
  name,
  size = 20,
  color,
  style,
}: IconSymbolProps) {
  const iconColor = color ?? Colors.text;

  const glyphMap: Record<IconName, string> = {
    home: '⌂',
    flask: '⚗',
    nutrition: '🥗',
    plus: '+',
    profile: '👤',
    check: '✓',
    alert: '⚠',
    info: 'ℹ',
    arrowBack: '←',
    chevronRight: '›',
    chevronDown: '⌄',
    heart: '♥',
    shield: '🛡',
    doctor: '🩺',
    filter: '⚙',
    search: '🔍',
    sparkles: '✦',
    arrowUp: '↑',
    arrowDown: '↓',
  };

  const glyph = glyphMap[name] || '•';
  const isEmoji = ['🥗', '👤', '🛡', '🩺', '🔍'].includes(glyph);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        style,
      ]}
    >
      <Text
        style={[
          styles.glyph,
          {
            fontSize: isEmoji ? size * 0.82 : size * 0.9,
            lineHeight: size,
            color: iconColor,
          },
        ]}
      >
        {glyph}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    textAlign: 'center',
    fontWeight: '700',
    includeFontPadding: false,
  },
});
