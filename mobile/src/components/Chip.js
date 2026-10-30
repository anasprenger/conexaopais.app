import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

// Etiqueta selecionável (filtros, opções de formulário)
export default function Chip({ label, icon, selected = false, onPress, color = colors.primary, soft = colors.primarySoft }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        { borderColor: selected ? color : colors.border, backgroundColor: selected ? soft : colors.surface },
      ]}
    >
      {icon && <Ionicons name={icon} size={14} color={selected ? color : colors.textMuted} style={styles.icon} />}
      <Text style={[styles.label, { color: selected ? color : colors.textMuted }]}>{label}</Text>
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
    borderWidth: 1.5,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: '600',
  },
});
