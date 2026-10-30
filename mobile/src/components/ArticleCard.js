import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, type } from '../theme';

// Cartão de artigo no estilo do site: categoria em ocre, título em Fraunces, resumo e autoria.
// featured = cartão de destaque maior; actions = botões extras (ex.: editar/excluir em Minha conta)
export default function ArticleCard({ artigo, onPress, featured = false, actions }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, featured && styles.featured, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Ler o artigo ${artigo.titulo}`}
    >
      <Text style={type.eyebrow}>{artigo.categoria}</Text>
      <Text style={[featured ? type.h1 : type.h3, styles.title]}>{artigo.titulo}</Text>
      <Text style={[type.muted, styles.summary]} numberOfLines={featured ? 4 : 2}>
        {artigo.resumo}
      </Text>
      <Text style={[type.small, styles.meta]}>
        {artigo.autor} · {featured ? `${artigo.data} · ` : ''}
        {artigo.leitura}
      </Text>
      {actions && <View style={styles.actions}>{actions}</View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    ...shadow,
  },
  featured: {
    padding: spacing.lg + 4,
    borderRadius: 32,
  },
  pressed: {
    opacity: 0.88,
  },
  title: {
    marginTop: spacing.sm,
  },
  summary: {
    marginTop: spacing.sm,
  },
  meta: {
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
