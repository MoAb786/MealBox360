export const colors = {
  // ─── Mealbox Design System Palette ───────────────────────────────────────
  // Primary
  primary:       '#4A6B3A',   // Forest green — buttons, icons, borders, links
  primaryDark:   '#3A5530',   // Pressed / hover state
  primarySoft:   'rgba(74,107,58,0.08)', // Tinted primary for subtle surfaces

  // Accent (use sparingly)
  accent:        '#E8C132',   // Golden — badges, active states, highlights
  accentDark:    '#C9A820',   // Accent hover

  // Surfaces
  bg:            '#F0EDE4',   // Warm off-white app background
  surface:       '#FAFAF5',   // Card / panel surface
  surfaceAlt:    '#EBEBE6',   // Nutrition chips, muted backgrounds

  // Text
  textPrimary:   '#1C1C1A',   // Headlines, bold labels
  textSecondary: '#6B6B65',   // Body text, captions
  textMuted:     '#9E9E96',   // Strikethrough, disabled

  // Structural
  divider:       '#DDDDD5',   // Horizontal rules, card separators
  shadow:        'rgba(60,60,40,0.10)', // Card drop shadow

  // ─── Legacy aliases (keep for backward compat with unchanged screens) ──
  forest:        '#4A6B3A',
  forestDark:    '#3A5530',
  forestLight:   '#4A6B3A',
  forestSoft:    'rgba(74,107,58,0.08)',
  lime:          '#E8C132',   // Remapped to accent gold
  limeDark:      '#C9A820',
  limeLight:     'rgba(232,193,50,0.15)',
  limeSoft:      'rgba(232,193,50,0.15)',
  mint:          '#EBEBE6',   // Remapped to surfaceAlt

  page:          '#F0EDE4',   // Remapped to bg
  white:         '#FAFAF5',   // Remapped to surface
  card:          '#FAFAF5',
  surfaceSubtle: '#EBEBE6',
  border:        '#DDDDD5',

  ink:           '#1C1C1A',
  text:          '#1C1C1A',
  muted:         '#6B6B65',
  mutedLight:    '#9E9E96',
  textMuted_:    '#6B6B65',
  subtext:       '#9E9E96',
  cream:         'rgba(255,255,255,0.75)',

  // Semantic
  danger:        '#EF4444',
  dangerBg:      '#FEE2E2',
  warning:       '#F59E0B',
  warningBg:     '#FEF3C7',
  success:       '#4A6B3A',
  successBg:     '#EBEBE6',

  // Category pastel chips
  categoryBg1: '#FFF3E2',
  categoryBg2: '#EBF7EE',
  categoryBg3: '#F3E8FF',
  categoryBg4: '#FDECEE',
  categoryBg5: '#E5F3FE',
  categoryBg6: '#FFFBE6',

  pastels: {
    vegetables: '#EBF7EE',
    fruits:     '#FDECEE',
    grains:     '#FFF3E2',
    dairy:      '#E5F3FE',
    protein:    '#F3E8FF',
    spices:     '#FFFBE6',
    all:        '#EBEBE6',
  },
};

export const spacing = {
  xs: 4,    // --space-xs
  sm: 8,    // --space-sm
  md: 16,   // --space-md  (also horizontal gutter)
  gutter: 20, // 20px horizontal padding per spec
  lg: 24,   // --space-lg
  xl: 32,   // --space-xl
  xxl: 40,
};

export const radius = {
  xs: 4,
  sm: 8,    // --radius-sm: nutrition chips, small tags
  md: 12,   // --radius-md: quantity buttons, badges
  lg: 18,   // --radius-lg: product image card
  xl: 28,   // --radius-xl: full-width CTA button
  xxl: 32,
  pill: 999, // --radius-full
  full: 999,
};

export const typography = {
  titleLarge: {
    fontSize: 22,           // --text-lg
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  titleMedium: {
    fontSize: 17,           // --text-md
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  bodyRegular: {
    fontSize: 13,           // --text-sm
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 11,           // --text-xs
    color: colors.textMuted,
  },
  labelBold: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
};

export const shadows = {
  header: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
  subtle: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },
  floating: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
};
