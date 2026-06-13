// ─── Design Token System ─────────────────────────────────────────────────────
// Single source of truth. No hardcoded hex strings outside this file.

export const theme = {
  background: {
    primary:   '#0C0C0B',   // near-black warm
    secondary: '#141413',   // card surfaces
    tertiary:  '#1C1C1A',   // elevated surfaces, skeleton
    overlay:   'rgba(12,12,11,0.85)',
  },
  text: {
    primary:   '#F5F0E8',   // warm off-white
    secondary: '#9C9789',   // muted warm gray
    tertiary:  '#5C5950',   // hints, disabled
    accent:    '#C8B89A',   // warm champagne — the one accent color
  },
  border: {
    subtle:    'rgba(245,240,232,0.07)',
    default:   'rgba(245,240,232,0.12)',
    strong:    'rgba(245,240,232,0.22)',
  },
  surface: {
    glass:     'rgba(255,255,255,0.04)',
    highlight: 'rgba(200,184,154,0.08)',
  },
  semantic: {
    danger:  '#C0392B',
    success: '#27AE60',
    warning: '#E67E22',
    info:    '#2980B9',
  },
} as const;

// ─── Backward-compat alias for charts / stores that still use Colors ─────────
export const Colors = {
  bg:          theme.background.primary,
  bgCard:      theme.background.secondary,
  bgSurface:   theme.background.secondary,
  bgMuted:     theme.background.tertiary,

  primary:     theme.text.accent,
  primaryLight:'#D4C7AD',
  primaryDark: '#A89676',
  accent:      theme.text.accent,

  danger:      theme.semantic.danger,
  success:     theme.semantic.success,
  warning:     theme.semantic.warning,
  info:        theme.semantic.info,

  textPrimary:   theme.text.primary,
  textSecondary: theme.text.secondary,
  textMuted:     theme.text.tertiary,
  textInverse:   theme.background.primary,

  border:      theme.border.default,
  borderLight: theme.border.strong,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const Typography = {
  fontFamily: {
    // Display / Hero headings — editorial gravitas
    displayLight:  'PlayfairDisplay_400Regular',  // 400 reads elegant at large sizes
    display:       'PlayfairDisplay_500Medium',
    displayBold:   'PlayfairDisplay_700Bold',
    // Body / UI — geometric, clean
    body:          'DMSans_400Regular',
    label:         'DMSans_500Medium',
    heading:       'DMSans_700Bold',
    // Labels / Captions / Tags — metadata
    mono:          'DMMono_400Regular',
  },
  fontSize: {
    // Strict scale: 11 12 13 14 16 18 22 28 36 44 56
    xs:       11,
    xxs:      12,
    sm:       13,
    base:     14,
    md:       16,
    lg:       18,
    xl:       22,
    xxl:      28,
    xxxl:     36,
    display:  44,
    hero:     56,
  },
  lineHeight: {
    heading: 1.25,
    body:    1.65,
    label:   1.0,
  },
} as const;

// ─── Spacing (8pt grid) ───────────────────────────────────────────────────────
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,   // screen horizontal padding — always 24px
  xl:   32,
  xxl:  48,   // minimum between sections
  xxxl: 64,
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
export const Radius = {
  sm:   4,    // pills, tags
  md:   8,    // chips
  lg:   12,   // small cards
  xl:   16,   // cards
  xxl:  24,   // content sheets, full-width containers max
  full: 9999,
} as const;

// ─── No shadows — borders on dark surfaces only ───────────────────────────────
export const Shadow = {
  card:   {},
  button: {},
} as const;

// ─── Disease tokens ───────────────────────────────────────────────────────────
export const Disease = {
  diabetes:   {
    color: theme.text.accent,
    icon: 'activity',
    label: 'Diabetes',
    params: 8,
    time: '3 min',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
  },
  kidney:     {
    color: '#8BA99B',
    icon: 'droplet',
    label: 'Kidney Disease',
    params: 14,
    time: '5 min',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
  },
  parkinsons: {
    color: '#A09ABF',
    icon: 'mic',
    label: "Parkinson's",
    params: 22,
    time: '6 min',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80',
  },
  lung_cancer:{
    color: '#BF9A9A',
    icon: 'wind',
    label: 'Lung Cancer',
    params: 15,
    time: '4 min',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
  },
  thyroid:    {
    color: '#B8AA8B',
    icon: 'thermometer',
    label: 'Thyroid',
    params: 12,
    time: '4 min',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=800&q=80',
  },
} as const;

export type DiseaseKey = keyof typeof Disease;
