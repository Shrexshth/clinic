import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, Radii, Spacing, Typography, Shadows } from '../theme';
import { MaterialRipple } from './MaterialRipple';

export interface HeaderBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function HeaderBar({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  style,
}: HeaderBarProps) {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      if (router.canGoBack()) {
        router.back();
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftRow}>
        {showBack && (
          <MaterialRipple
            onPress={handleBack}
            borderless
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={Colors.text} strokeWidth={2.4} />
          </MaterialRipple>
        )}
        <View style={styles.titleColumn}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.soft,
    minHeight: 56,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
    marginRight: Spacing.sm,
    borderRadius: Radii.pills,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontFamily: Typography.title.fontFamily,
    fontSize: Typography.title.fontSize,
    lineHeight: Typography.title.lineHeight,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginTop: 2,
  },
  rightAction: {
    marginLeft: Spacing.md,
  },
});
