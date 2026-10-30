import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

const variants = {
  primary: { background: colors.primary, text: colors.textOnPrimary, border: colors.primary },
  accent: { background: colors.accent, text: colors.textOnPrimary, border: colors.accent },
  outline: { background: 'transparent', text: colors.primary, border: colors.primary },
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
      {icon && <Ionicons name={icon} size={small ? 16 : 20} color={theme.text} style={styles.icon} />}
      <Text style={[styles.text, small && styles.smallText, { color: theme.text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  small: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontSize: fontSize.body,
    fontWeight: '700',
  },
  smallText: {
    fontSize: fontSize.small,
  },
});
