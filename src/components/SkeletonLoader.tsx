import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radii, Spacing } from '@/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBox({
  width = '100%',
  height = 20,
  borderRadius = Radii.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content placeholder"
      style={[
        styles.skeletonBox,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[styles.cardContainer, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading card"
    >
      <View style={styles.cardHeader}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <View style={styles.cardHeaderTexts}>
          <SkeletonBox width="55%" height={16} borderRadius={4} />
          <SkeletonBox width="35%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <SkeletonBox width="100%" height={14} borderRadius={4} />
        <SkeletonBox width="85%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonReportCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[styles.reportCard, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading biomarker card"
    >
      <View style={styles.reportRow}>
        <View style={{ flex: 1 }}>
          <SkeletonBox width="60%" height={18} borderRadius={4} />
          <SkeletonBox width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <SkeletonBox width={72} height={26} borderRadius={Radii.pills} />
      </View>
      <View style={{ marginTop: Spacing.md }}>
        <SkeletonBox width="100%" height={8} borderRadius={4} />
      </View>
    </View>
  );
}

export function SkeletonMealCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[styles.mealCard, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading meal card"
    >
      <View style={styles.mealRow}>
        <SkeletonBox width={44} height={44} borderRadius={12} />
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <SkeletonBox width="70%" height={16} borderRadius={4} />
          <SkeletonBox width="50%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <SkeletonBox width={28} height={28} borderRadius={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonBox: {
    backgroundColor: '#E8DADB',
  },
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: Radii.cards,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTexts: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  cardBody: {
    marginTop: Spacing.md,
  },
  reportCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.cards,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.cards,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
