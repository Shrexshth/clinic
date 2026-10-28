import { View, type ViewProps } from 'react-native';
import { Colors } from '@/theme';

export type ThemedViewProps = ViewProps & {
  variant?: 'background' | 'surface' | 'surfaceVariant';
  type?: string;
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  variant = 'background',
  type,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  let bg: string = Colors.background;

  if (variant === 'surface') bg = Colors.card;
  if (variant === 'surfaceVariant') bg = Colors.redTint;

  if (type === 'backgroundElement') bg = Colors.redTint;
  if (type === 'backgroundSelected') bg = Colors.border;

  return <View style={[{ backgroundColor: bg }, style]} {...otherProps} />;
}
