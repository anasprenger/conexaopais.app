// Identidade visual do Conexão Pais
// Azul = o adulto (confiança, acolhimento) | Coral = o jovem (energia, afeto)

export const colors = {
  primary: '#2F4B9A',
  primaryDark: '#22386F',
  primarySoft: '#E7ECF8',
  accent: '#FF7A5C',
  accentDark: '#E0573A',
  accentSoft: '#FFE8E1',

  background: '#FAF7F2',
  surface: '#FFFFFF',
  border: '#E6E1D8',

  text: '#1E2433',
  textMuted: '#5E6678',
  textOnPrimary: '#FFFFFF',

  success: '#2E9E6A',
  successSoft: '#DFF3EA',
  warning: '#C77C12',
  warningSoft: '#FDF0DC',
  danger: '#D64545',
  dangerSoft: '#FBE3E3',
};

// Cada categoria do glossário tem uma cor e um ícone (Ionicons)
export const categoryStyles = {
  giria: { color: '#E0573A', soft: '#FFE8E1', icon: 'chatbubble-ellipses' },
  meme: { color: '#7C5CE0', soft: '#EEE9FC', icon: 'happy' },
  abreviacao: { color: '#2F4B9A', soft: '#E7ECF8', icon: 'text' },
  tendencia: { color: '#16917F', soft: '#E0F4F1', icon: 'trending-up' },
  comportamento: { color: '#C77C12', soft: '#FDF0DC', icon: 'phone-portrait' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  subtitle: 18,
  title: 22,
  hero: 30,
};

export const shadow = {
  shadowColor: '#1E2433',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};
