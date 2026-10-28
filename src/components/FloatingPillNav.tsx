import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors, Radii, Shadows, Spacing, Typography } from '../theme';

export interface NavTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface FloatingPillNavProps {
  tabs: NavTabItem[];
  activeTabId: string;
  onTabPress: (tabId: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * FloatingPillNav: Dark maroon (#6E0B14) floating pill tab bar.
 * Active tab is marked with a crimson-red (#B3141F) circle with white icon.
 * Includes Android ripple feedback and floating shadow.
 */
import { triggerLightHaptic } from '@/utils/haptics';

export function FloatingPillNav({
  tabs,
  activeTabId,
  onTabPress,
  style,
}: FloatingPillNavProps) {
  const handleTabPress = (tabId: string) => {
    triggerLightHaptic();
    onTabPress(tabId);
  };

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="tablist"
      accessibilityLabel="Navigation bar"
    >
      <View style={styles.pillBar}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const Icon = tab.icon;

          return (
            <Pressable
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.label} tab`}
              accessibilityState={{ selected: isActive }}
              android_ripple={{
                color: Colors.rippleLight,
                borderless: true,
              }}
              style={({ pressed }) => [
                styles.tabItem,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  isActive ? styles.activeIconCircle : styles.inactiveIconCircle,
                ]}
              >
                <Icon
                  size={20}
                  color={isActive ? Colors.white : 'rgba(255, 255, 255, 0.65)'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </View>
              <Text
                maxFontSizeMultiplier={1.4}
                style={[
                  styles.tabLabel,
                  isActive ? styles.activeLabel : styles.inactiveLabel,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  pillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.deepMaroon,
    borderRadius: Radii.pills,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    ...Shadows.floating,
    maxWidth: 420,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pills,
  },
  pressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: Radii.pills,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconCircle: {
    backgroundColor: Colors.primary,
    ...Shadows.soft,
  },
  inactiveIconCircle: {
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    lineHeight: 12,
    marginTop: 2,
  },
  activeLabel: {
    color: Colors.white,
    fontWeight: '700',
  },
  inactiveLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '500',
  },
});
