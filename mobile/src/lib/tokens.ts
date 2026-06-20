/**
 * Design tokens for Rusil Stream mobile app.
 * Single source of truth — import from here, never hardcode values in components.
 */

// ─── Color ───────────────────────────────────────────────────────────────────

export const colors = {
  // Backgrounds — Netflix-grade dark ramp
  bg:         "#080A0F",   // deepest background
  bgSurface:  "#0F1117",   // elevated surface (cards, sheets)
  bgRaised:   "#161A23",   // raised card (menus, inputs)
  bgHighest:  "#1E2330",   // highest surface (popovers, hover)

  // Brand
  red:        "#E50914",
  redDim:     "rgba(229,9,20,0.15)",
  redGlow:    "rgba(229,9,20,0.08)",

  // Text ramp — perceived luminance scale
  text100:    "#FFFFFF",
  text80:     "rgba(255,255,255,0.80)",
  text60:     "rgba(255,255,255,0.60)",
  text40:     "rgba(255,255,255,0.40)",
  text20:     "rgba(255,255,255,0.20)",

  // Borders
  border:     "rgba(255,255,255,0.08)",
  borderMid:  "rgba(255,255,255,0.14)",
  borderHigh: "rgba(255,255,255,0.22)",

  // Status
  gold:       "#F3C97A",
  success:    "#22C55E",
  error:      "#FF6B6B",
  errorDim:   "rgba(255,107,107,0.12)",

  // Scrim
  scrim:      "rgba(8,10,15,0.90)",
} as const;

// ─── Spacing — 4pt grid ───────────────────────────────────────────────────────

export const space = {
  1:  4,
  2:  8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ─── Border radius ───────────────────────────────────────────────────────────

export const radius = {
  xs:  6,
  sm:  10,
  md:  14,
  lg:  18,
  xl:  24,
  xxl: 32,
  full: 999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const type = {
  // Sizes
  size: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   26,
    xxl:  32,
    hero: 42,
  },
  // Weights (Platform.OS agnostic string values)
  weight: {
    regular: "400" as const,
    medium:  "500" as const,
    semibold:"600" as const,
    bold:    "700" as const,
    black:   "900" as const,
  },
  // Line heights
  leading: {
    tight:  1.15,
    normal: 1.45,
    loose:  1.65,
  },
  // Letter spacing
  tracking: {
    tightest: -0.8,
    tight:    -0.4,
    normal:    0,
    wide:      0.4,
    wider:     1.0,
    widest:    2.0,
  },
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

import { Platform } from "react-native";

export const shadow = {
  sm: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.40,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
  }),
  md: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.55,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.65,
      shadowRadius: 24,
    },
    android: { elevation: 16 },
  }),
} as const;

// ─── Animation timings ───────────────────────────────────────────────────────

export const duration = {
  fast:   150,
  normal: 250,
  slow:   380,
} as const;
