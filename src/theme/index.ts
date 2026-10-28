import {
  Colors,
  Fonts,
  Radii,
  Shadows,
  Spacing,
  Typography,
} from './tokens';

export * from './tokens';

export interface AppTheme {
  colors: typeof Colors;
  radii: typeof Radii;
  spacing: typeof Spacing;
  typography: typeof Typography;
  shadows: typeof Shadows;
  fonts: typeof Fonts;
}

export function useTheme(): AppTheme {
  return {
    colors: Colors,
    radii: Radii,
    spacing: Spacing,
    typography: Typography,
    shadows: Shadows,
    fonts: Fonts,
  };
}

// Alias for useTheme
export const useAppTheme = useTheme;
