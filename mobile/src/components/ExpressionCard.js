import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, shadow, spacing } from '../theme';
import CategoryBadge from './CategoryBadge';

// Item do glossário. "actions" permite incluir botões extras (ex.: editar/excluir no painel admin)
export default function ExpressionCard({ expression, onPress, actions }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Ver a expressão ${expression.term}`}
    >
      <View style={styles.header}>
        <Text style={styles.term}>{expression.term}</Text>
        {!actions && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
      </View>
      <CategoryBadge category={expression.category} />
      <Text style={styles.meaning} numberOfLines={2}>
        {expression.meaning}
      </Text>
      {actions && <View style={styles.actions}>{actions}</View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  term: {
    flex: 1,
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  meaning: {
    marginTop: spacing.sm,
    fontSize: fontSize.small,
    lineHeight: 20,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
