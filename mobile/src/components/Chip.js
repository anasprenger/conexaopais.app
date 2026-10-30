import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, fonts, radius, spacing } from '../theme';

// Etiqueta selecionável (filtros, opções de formulário). Como no site:
// selecionada = verde; demais = menta.
export default function Chip({ label, icon, selected = false, onPress, color = colors.primary, soft = colors.mint }) {
  const textColor = selected ? colors.textOnPrimary : colors.mintText;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, { backgroundColor: selected ? color : soft }]}
    >
      {icon && <Ionicons name={icon} size={14} color={textColor} style={styles.icon} />}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.small,
  },
});
