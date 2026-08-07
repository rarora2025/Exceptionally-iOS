// Exceptionally — merged design language.
// Quizlet feel (soft cards, generous rounding, subtle shadows, no hard black
// borders) + Exceptionally accent (chartreuse) and Bricolage display type.

export const colors = {
  // surfaces
  bg: '#F4F5F8', // app background — soft cool paper
  bgWarm: '#F6F6F1',
  surface: '#FFFFFF', // cards
  surfaceSunken: '#F6F7FA', // inset fields / sunken wells

  // ink
  ink: '#16161A', // primary text, near-black
  inkSoft: '#54545F', // secondary text
  muted: '#9A9AA6', // labels, placeholders, inactive

  // lines (soft — replaces the old 2px near-black borders)
  line: '#ECECF1',
  lineStrong: '#E1E1E8',

  // brand accent
  accent: '#D6F24B', // chartreuse
  accentDeep: '#C4E236',
  accentInk: '#20270A', // deep olive-black text on chartreuse

  // dark pill (secondary emphasis CTA)
  dark: '#16161A',
  onDark: '#FFFFFF',

  // disabled control
  disabled: '#E7E7EC',
  disabledInk: '#A7A7B2',

  // link / info blue (kept for text links)
  link: '#3B62E8',

  // soft tints for artifact / people / tool cards
  tintBlue: '#E9F0FF',
  tintViolet: '#EFEAFB',
  tintPeach: '#FFE7D6',
  tintLilac: '#E8DBFF',
  tintLime: '#EEF7C9',
  tintAmber: '#FFEFC7',
} as const;

// Map the prototype's legacy hexes onto the new palette so ported data
// (tints, status colors) lands in the merged system.
export const tint = (legacy: string): string => {
  const map: Record<string, string> = {
    '#D6F24B': colors.accent,
    '#CFE3FF': colors.tintBlue,
    '#E9F0FF': colors.tintBlue,
    '#FFD9C2': colors.tintPeach,
    '#E8DBFF': colors.tintLilac,
    '#EDF7BE': colors.tintLime,
    '#EFEAFB': colors.tintViolet,
    '#FBE8CF': colors.tintAmber,
    '#FFE9A8': colors.tintAmber,
    '#F3F3EE': colors.surfaceSunken,
  };
  return map[legacy?.toUpperCase?.()] ?? legacy;
};

export const font = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  displaySemi: 'BricolageGrotesque_600SemiBold',
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semi: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

export const space = (n: number) => n * 4;

export const shadow = {
  card: {
    shadowColor: '#1A1A2E',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  soft: {
    shadowColor: '#1A1A2E',
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  accent: {
    shadowColor: '#AFC733',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  dark: {
    shadowColor: '#16161A',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  tab: {
    shadowColor: '#1A1A2E',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;

export const fontsToLoad = {} as const; // populated in App.tsx via the google-font packages
