/**
 * Non-color design tokens. Colors live in hooks/useTheme.tsx (they depend
 * on the active theme + light/dark mode); everything else that should look
 * the same everywhere in the app — spacing, corner radius, type scale,
 * shadows — lives here instead, so changing one value here changes it
 * everywhere it's used.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  pill: 999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 18,
  title: 28,
  display: 30,
};

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  heavy: "900" as const,
};

// Standard elevation/shadow presets. `color` is intentionally omitted here —
// pass `colors.shadow` from the active theme alongside these when applying.
export const shadow = {
  sm: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  lg: {
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
};
