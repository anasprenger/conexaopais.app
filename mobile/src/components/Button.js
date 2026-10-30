import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, fonts, spacing } from '../theme';

// Variantes equivalentes às do site: primary (verde), accent (ocre, "cta"),
// outline ("quiet"), soft (menta), ghost e danger
const variants = {
  primary: { background: colors.primary, text: colors.textOnPrimary, border: colors.primary },
  accent: { background: colors.accent, text: colors.textOnAccent, border: colors.accent },
  outline: { background: 'transparent', text: colors.primary, border: 'rgba(67, 87, 51, 0.3)' },
  soft: { background: colors.mint, text: colors.mintText, border: colors.mint },
  ghost: { background: 'transparent', text: colors.primary, border: 'transparent' },
  danger: { background: colors.dangerSoft, text: colors.danger, border: colors.dangerSoft },
};

export default function Button({ title, onPress, variant = 'primary', icon, small = false, disabled = false, style }) {
  const theme = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        small && styles.small,
        { backgroundColor: theme.background, borderColor: theme.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={small ? 16 : 19} color={theme.text} style={styles.icon} />}
      <Text style={[styles.text, small && styles.smallText, { color: theme.text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  small: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: fontSize.body,
  },
  smallText: {
    fontSize: fontSize.small,
  },
});
