// Identidade visual do Conexão Pais (a mesma do site conexaopais.com.br):
// verde musgo (primária), ocre (destaque), menta (apoio), Fraunces nos títulos e DM Sans nos textos.

export const colors = {
  background: '#F5F8FA',
  surface: '#EEF2F4',
  card: '#FCFEFF',
  border: '#D8DEE2',

  text: '#1B281E',
  textMuted: '#586767',

  primary: '#435733',
  primaryDark: '#33442A',
  primarySoft: '#E4EBDC',
  textOnPrimary: '#FAF7EC',

  accent: '#E1791B',
  accentDark: '#B85E0F',
  accentSoft: '#FBEBDD',
  textOnAccent: '#FEFCF4',

  mint: '#CFF2DE',
  mintSoft: '#E5F7EC',
  mintText: '#223D27',

  logo: '#627144',

  success: '#2F7D4F',
  successSoft: '#DFF1E5',
  warning: '#A65A00',
  warningSoft: '#FCEFD9',
  danger: '#C8102E',
  dangerSoft: '#FCE4E6',
};

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayRegular: 'Fraunces_400Regular',
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  subtitle: 19,
  title: 24,
  hero: 32,
};

// Estilos de texto reutilizados nas telas (equivalentes aos h1/h2/h3 e textos do site)
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.primary, letterSpacing: -0.5 },
  h1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.primary, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.primary },
  h3: { fontFamily: fonts.display, fontSize: 19, lineHeight: 25, color: colors.primary },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.text },
  muted: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textMuted },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textMuted },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.accentDark },
};

export const shadow = {
  shadowColor: '#1B281E',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

// Forma orgânica ("blob") usada no site em avatares e detalhes decorativos
export function blob(size) {
  return {
    width: size,
    height: size,
    borderTopLeftRadius: size * 0.62,
    borderTopRightRadius: size * 0.38,
    borderBottomRightRadius: size * 0.46,
    borderBottomLeftRadius: size * 0.54,
  };
}
