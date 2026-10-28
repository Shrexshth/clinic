import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Filter,
  FeDropShadow,
} from 'react-native-svg';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { CircleArrowButton } from '@/components/CircleArrowButton';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';

export interface WelcomeViewProps {
  onGetStarted: () => void;
}

/**
 * Welcome Screen:
 * - Dark maroon gradient (#1E0709 to #6E0B14)
 * - Blood-drop and pulse-line illustration drawn with react-native-svg
 * - Headline "Understand Your Blood. Eat Better." with "Eat Better" in crimson (#B3141F)
 * - "Get Started" button with arrow and a round white action button
 */
export function WelcomeView({ onGetStarted }: WelcomeViewProps) {
  return (
    <LinearGradient
      colors={[Colors.dark, Colors.deepMaroon]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Top Badge */}
          <View style={styles.badge}>
            <Sparkles size={14} color={Colors.white} />
            <Text style={styles.badgeText}>CLINIXBRIDGE HEALTH</Text>
          </View>

          {/* SVG Illustration: Blood Drop + Pulse Line */}
          <View style={styles.illustrationWrapper}>
            <Svg width={240} height={240} viewBox="0 0 240 240">
              <Defs>
                <SvgGradient id="dropGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#E5533D" stopOpacity="0.95" />
                  <Stop offset="0.6" stopColor={Colors.primary} stopOpacity="1" />
                  <Stop offset="1" stopColor="#55070E" stopOpacity="1" />
                </SvgGradient>

                <SvgGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="rgba(255, 255, 255, 0.2)" />
                  <Stop offset="0.4" stopColor="#FFFFFF" />
                  <Stop offset="0.6" stopColor="#FFFFFF" />
                  <Stop offset="1" stopColor="rgba(255, 255, 255, 0.2)" />
                </SvgGradient>
              </Defs>

              {/* Ambient Glow Circles */}
              <Circle cx={120} cy={120} r={95} fill="rgba(179, 20, 31, 0.18)" />
              <Circle cx={120} cy={120} r={75} fill="rgba(179, 20, 31, 0.25)" />

              {/* Stylized Blood Drop */}
              <Path
                d="M 120 40 C 120 40, 70 115, 70 152 A 50 50 0 1 0 170 152 C 170 115, 120 40, 120 40 Z"
                fill="url(#dropGrad)"
              />

              {/* Drop Reflection Highlight */}
              <Path
                d="M 105 125 C 98 135, 96 150, 102 165 C 103 167, 100 168, 98 166 C 90 152, 92 135, 101 123 C 103 121, 106 123, 105 125 Z"
                fill="rgba(255, 255, 255, 0.35)"
              />

              {/* Horizontal EKG Pulse Wave Line */}
              <Path
                d="M 20 148 L 75 148 L 88 120 L 100 180 L 118 105 L 132 165 L 145 136 L 158 148 L 220 148"
                stroke="url(#pulseGrad)"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Pulse Nodes */}
              <Circle cx={118} cy={105} r={4.5} fill="#FFFFFF" />
              <Circle cx={100} cy={180} r={4} fill={Colors.redTint} />
              <Circle cx={132} cy={165} r={3.5} fill="#FFFFFF" />
            </Svg>
          </View>

          {/* Headline: Understand Your Blood. Eat Better. */}
          <View style={styles.textBlock}>
            <Text style={styles.headline}>
              Understand Your Blood.{'\n'}
              <Text style={styles.crimsonHighlight}>Eat Better.</Text>
            </Text>

            <Text style={styles.subtext}>
              Transform clinical lab markers into personalized, whole-food nutritional strategies with deterministic precision.
            </Text>
          </View>

          {/* Action Row: "Get Started" button with arrow and round white action button */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={onGetStarted}
              android_ripple={{ color: Colors.rippleLight, borderless: false }}
              style={styles.getStartedButton}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <ArrowRight size={20} color={Colors.white} strokeWidth={2.4} style={{ marginLeft: Spacing.sm }} />
            </Pressable>

            <CircleArrowButton
              direction="right"
              onPress={onGetStarted}
              size={56}
              arrowColor={Colors.deepMaroon}
              backgroundColor={Colors.white}
              style={{ marginLeft: Spacing.md }}
            />
          </View>

          {/* Clinical Disclaimer */}
          <View style={styles.disclaimerBox}>
            <MedicalDisclaimer compact />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pills,
    marginTop: Spacing.sm,
  },
  badgeText: {
    color: Colors.white,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: Spacing.xs,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  textBlock: {
    alignItems: 'center',
    textAlign: 'center',
  },
  headline: {
    color: Colors.white,
    fontFamily: Typography.display.fontFamily,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    textAlign: 'center',
  },
  crimsonHighlight: {
    color: Colors.primary,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    lineHeight: Typography.bodyLarge.lineHeight,
    textAlign: 'center',
    marginTop: Spacing.md,
    maxWidth: 320,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: Spacing.lg,
  },
  getStartedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: Radii.pills,
    paddingHorizontal: Spacing.xl,
    ...Shadows.floating,
  },
  getStartedText: {
    color: Colors.white,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '700',
  },
  disclaimerBox: {
    width: '100%',
    alignItems: 'center',
  },
});
