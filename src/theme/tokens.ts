/**
 * ClinixBridge Design System & Theme Tokens
 * Specified Brand Colors:
 * - primary: #B3141F
 * - deep maroon: #6E0B14
 * - dark: #1E0709
 * - background: #FBF4F4
 * - card: #FFFFFF
 * - red tint: #FCE8E9
 * - text: #1E1416
 * - secondary text: #7A6B6D
 * - status normal: #1F9D61
 * - borderline: #E0A100
 * - abnormal: #E5533D
 */

export const Colors = {
  primary: '#B3141F',
  deepMaroon: '#6E0B14',
  dark: '#1E0709',
  background: '#FBF4F4',
  card: '#FFFFFF',
  redTint: '#FCE8E9',
  text: '#1E1416',
  secondaryText: '#7A6B6D',

  // Status colors
  statusNormal: '#1F9D61',
  statusNormalBg: '#E8F5EE',
  statusBorderline: '#E0A100',
  statusBorderlineBg: '#FFF7E6',
  statusAbnormal: '#E5533D',
  statusAbnormalBg: '#FDEDEB',

  // Utility colors
  white: '#FFFFFF',
  border: '#E8DCDE',
  borderLight: '#F3EAEB',
  ripple: 'rgba(179, 20, 31, 0.12)',
  rippleLight: 'rgba(255, 255, 255, 0.2)',
  overlay: 'rgba(30, 7, 9, 0.55)',
} as const;

export const Radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  cards: 24, // Specified: cards 24
  pills: 999, // Specified: pills 999
} as const;

export const Spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export type SpacingKey = keyof typeof Spacing;

export const Fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const Typography = {
  display: {
    fontFamily: Fonts.extraBold,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800' as const,
  },
  hero: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodyBold: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
  small: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  smallBold: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as const,
  },
  caption: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
  },
} as const;

export const Shadows = {
  soft: {
    shadowColor: Colors.deepMaroon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  card: {
    shadowColor: '#1E0709',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: '#1E0709',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;
