export const colors = {
  // Primary Reference Palette
  forest: '#003B36',       // Deep forest-teal for headers, primary brand
  forestDark: '#002925',   // Darker forest for deep accents
  forestLight: '#084B45',  // Lighter forest variant
  forestSoft: 'rgba(0, 59, 54, 0.08)', // Tinted forest for badges/subtle boxes
  lime: '#B9ED62',         // High-energy lime-green for buttons, badges, selected pills
  limeDark: '#9FD447',     // Lime active/pressed state
  limeLight: '#E8F8CE',    // Subtle lime background tint
  limeSoft: '#E8F8CE',     // Soft lime tint alias
  mint: '#D1FAE5',         // Minty fresh light green

  // Neutral & Surfaces
  page: '#F6F8F7',         // Clean soft grayish-green background
  white: '#FFFFFF',
  card: '#FFFFFF',
  surface: '#FFFFFF',      // Surface alias
  surfaceSubtle: '#F1F4F3',
  divider: '#E4EAE7',
  border: '#DFE5E2',

  // Typography
  ink: '#12201D',          // Primary high-contrast dark text
  text: '#12201D',         // High-contrast deep slate/teal
  muted: '#4A5B57',        // Secondary muted body text
  mutedLight: '#768783',   // Lighter secondary text
  textMuted: '#4A5B57',    // Body text secondary
  subtext: '#768783',      // Subtle metadata / placeholders
  cream: '#FEFFE5',        // Soft warm cream for header subtitles

  // Semantic
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  success: '#10B981',
  successBg: '#D1FAE5',

  // Pastel Category Backgrounds (matching reference 1 & 2 tiles)
  categoryBg1: '#FFF3E2', // Grains (amber-tinted)
  categoryBg2: '#EBF7EE', // Vegetables (sage-green)
  categoryBg3: '#F3E8FF', // Protein (lavender-tinted)
  categoryBg4: '#FDECEE', // Fruits (blush-coral)
  categoryBg5: '#E5F3FE', // Dairy (sky-blue)
  categoryBg6: '#FFFBE6', // Spices (golden yellow)

  pastels: {
    vegetables: '#EBF7EE',
    fruits: '#FDECEE',
    grains: '#FFF3E2',
    dairy: '#E5F3FE',
    protein: '#F3E8FF',
    spices: '#FFFBE6',
    all: '#E6F4F1',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  gutter: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 9999,
  full: 9999,
};

export const typography = {
  titleLarge: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  titleMedium: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  bodyRegular: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    color: colors.subtext,
  },
  labelBold: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.text,
  },
};

export const shadows = {
  header: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  card: {
    shadowColor: '#0D2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  subtle: {
    shadowColor: '#0D2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: '#0D2420',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
};
