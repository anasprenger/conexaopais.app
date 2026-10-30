import { DefaultTheme } from '@react-navigation/native';
import { colors } from '../theme';

// Tema do React Navigation com as cores do app
export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

// Opções de cabeçalho compartilhadas entre stack e abas
export const headerOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '800', color: colors.text },
};
