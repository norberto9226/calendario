export type SeasonTheme = 'otono' | 'primavera' | 'verano' | 'invierno';

export interface SeasonConfig {
  id: SeasonTheme;
  name: string;
  emoji: string;
  subtitle: string;
  bgHex: string;
  surfaceHex: string;
  cardBgHex: string;
  headerBgHex: string;
  borderHex: string;
  borderStrongHex: string;
  primaryColor: string;
  primaryHover: string;
  primaryLight: string;
  accentColor: string;
  accentLight: string;
  textColor: string;
  mutedTextColor: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  gradientBadge: string;
}

export const SEASONS_CONFIG: Record<SeasonTheme, SeasonConfig> = {
  otono: {
    id: 'otono',
    name: 'Otoño',
    emoji: '🍂',
    subtitle: 'Hojas doradas, terracota y calidez',
    bgHex: '#FAF6F0',
    surfaceHex: '#FFFFFF',
    cardBgHex: '#FDFBF8',
    headerBgHex: '#F7EFE6',
    borderHex: '#E8DCCF',
    borderStrongHex: '#DFCFC1',
    primaryColor: '#A8421E',
    primaryHover: '#8F3516',
    primaryLight: '#FDF2ED',
    accentColor: '#D97706',
    accentLight: '#FEF9EE',
    textColor: '#382417',
    mutedTextColor: '#8C6D58',
    pillBg: '#FDF6EE',
    pillBorder: '#EED7C5',
    pillText: '#4A2D1A',
    gradientBadge: 'from-[#A8421E] via-[#B84E25] to-[#C25934]',
  },
  primavera: {
    id: 'primavera',
    name: 'Primavera',
    emoji: '🌸',
    subtitle: 'Flores de cerezo, verde fresco y brisa',
    bgHex: '#FAF5F7',
    surfaceHex: '#FFFFFF',
    cardBgHex: '#FCF8FA',
    headerBgHex: '#F6EBF0',
    borderHex: '#EED6E0',
    borderStrongHex: '#E2C2D0',
    primaryColor: '#C44D76',
    primaryHover: '#A8385E',
    primaryLight: '#FDF0F4',
    accentColor: '#3F8A56',
    accentLight: '#F0F9F2',
    textColor: '#381C28',
    mutedTextColor: '#8C5B72',
    pillBg: '#FDF2F6',
    pillBorder: '#F2D0DC',
    pillText: '#522035',
    gradientBadge: 'from-[#C44D76] via-[#D8628C] to-[#E284A5]',
  },
  verano: {
    id: 'verano',
    name: 'Verano',
    emoji: '☀️',
    subtitle: 'Luz dorada, cielo abierto y vitalidad',
    bgHex: '#FCFAF2',
    surfaceHex: '#FFFFFF',
    cardBgHex: '#FDFCF7',
    headerBgHex: '#F6F0E0',
    borderHex: '#EAE0C8',
    borderStrongHex: '#DECFAe',
    primaryColor: '#C96E14',
    primaryHover: '#AD590A',
    primaryLight: '#FEF6EC',
    accentColor: '#0E7490',
    accentLight: '#EFFBFE',
    textColor: '#382410',
    mutedTextColor: '#876B4B',
    pillBg: '#FEF7EC',
    pillBorder: '#F6DEBE',
    pillText: '#54300D',
    gradientBadge: 'from-[#C96E14] via-[#D97D22] to-[#E5933A]',
  },
  invierno: {
    id: 'invierno',
    name: 'Invierno',
    emoji: '❄️',
    subtitle: 'Nieve serena, azul escarcha y silencio',
    bgHex: '#F2F6FA',
    surfaceHex: '#FFFFFF',
    cardBgHex: '#F7FAFC',
    headerBgHex: '#E4ECF5',
    borderHex: '#D2DFEC',
    borderStrongHex: '#BED0E2',
    primaryColor: '#1E649E',
    primaryHover: '#154E7D',
    primaryLight: '#EEF5FC',
    accentColor: '#2563EB',
    accentLight: '#EFF6FF',
    textColor: '#182736',
    mutedTextColor: '#57718A',
    pillBg: '#EFF5FB',
    pillBorder: '#CDE0F2',
    pillText: '#183B5C',
    gradientBadge: 'from-[#1E649E] via-[#2D7BBF] to-[#4395DD]',
  },
};
