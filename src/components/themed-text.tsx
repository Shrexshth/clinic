import { Platform, Text, type TextProps } from 'react-native';
import { Colors, Typography } from '@/theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code' | 'caption';
  color?: string;
  themeColor?: string;
};

export function ThemedText({
  style,
  type = 'default',
  color,
  themeColor,
  ...rest
}: ThemedTextProps) {
  let textColor = color ?? Colors.text;

  if (themeColor === 'textSecondary') {
    textColor = Colors.secondaryText;
  } else if (themeColor === 'text') {
    textColor = Colors.text;
  }

  const typeStyles = {
    caption: {
      fontSize: Typography.caption.fontSize,
      lineHeight: Typography.caption.lineHeight,
      fontWeight: Typography.caption.fontWeight,
    },
    small: {
      fontSize: Typography.small.fontSize,
      lineHeight: Typography.small.lineHeight,
      fontWeight: Typography.small.fontWeight,
    },
    smallBold: {
      fontSize: Typography.smallBold.fontSize,
      lineHeight: Typography.smallBold.lineHeight,
      fontWeight: Typography.smallBold.fontWeight,
    },
    default: {
      fontSize: Typography.body.fontSize,
      lineHeight: Typography.body.lineHeight,
      fontWeight: Typography.body.fontWeight,
    },
    title: {
      fontSize: Typography.hero.fontSize,
      lineHeight: Typography.hero.lineHeight,
      fontWeight: Typography.hero.fontWeight,
    },
    subtitle: {
      fontSize: Typography.title.fontSize,
      lineHeight: Typography.title.lineHeight,
      fontWeight: Typography.title.fontWeight,
    },
    link: {
      fontSize: Typography.small.fontSize,
      lineHeight: Typography.small.lineHeight,
      color: Colors.primary,
      fontWeight: Typography.smallBold.fontWeight,
    },
    linkPrimary: {
      fontSize: Typography.small.fontSize,
      lineHeight: Typography.small.lineHeight,
      color: Colors.primary,
      fontWeight: Typography.title.fontWeight,
    },
    code: {
      fontSize: Typography.caption.fontSize,
      lineHeight: Typography.caption.lineHeight,
      fontWeight: Platform.select({ android: Typography.smallBold.fontWeight }) ?? Typography.small.fontWeight,
    },
  }[type];

  return <Text style={[{ color: textColor }, typeStyles, style]} {...rest} />;
}
