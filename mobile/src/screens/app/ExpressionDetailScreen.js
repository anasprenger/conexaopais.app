import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import CategoryBadge from '../../components/CategoryBadge';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import { useFavorites } from '../../contexts/FavoritesContext';
import { getExpression } from '../../data/expressions';
import { colors, fontSize, radius, shadow, spacing } from '../../theme';

export default function ExpressionDetailScreen({ navigation, route }) {
  const expression = getExpression(route.params?.id);
  const { isFavorite, toggleFavorite } = useFavorites();

  useLayoutEffect(() => {
    if (expression) navigation.setOptions({ title: expression.term });
  }, [navigation, expression]);

  if (!expression) {
    return (
      <Screen>
        <EmptyState icon="alert-circle" title="Expressão não encontrada" />
      </Screen>
    );
  }

  const favorite = isFavorite(expression.id);

  return (
    <Screen>
      <View style={styles.topRow}>
        <CategoryBadge category={expression.category} />
        <Pressable
          onPress={() => toggleFavorite(expression.id)}
          style={[styles.favorite, favorite && styles.favoriteActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
        >
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={18} color={colors.accentDark} />
          <Text style={styles.favoriteText}>{favorite ? 'Favorita' : 'Favoritar'}</Text>
        </Pressable>
      </View>

      <Text style={styles.term}>{expression.term}</Text>
      <Text style={styles.meaning}>{expression.meaning}</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="chatbox-ellipses-outline" size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>Exemplo de uso</Text>
        </View>
        <Text style={styles.example}>{expression.example}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="compass-outline" size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>De onde vem</Text>
        </View>
        <Text style={styles.cardText}>{expression.origin}</Text>
      </View>

      <View style={[styles.card, styles.tipCard]}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart-circle-outline" size={20} color={colors.accentDark} />
          <Text style={[styles.cardTitle, styles.tipTitle]}>Como puxar conversa</Text>
        </View>
        <Text style={styles.cardText}>{expression.tip}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favorite: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accentSoft,
    backgroundColor: colors.surface,
  },
  favoriteActive: {
    backgroundColor: colors.accentSoft,
  },
  favoriteText: {
    marginLeft: 6,
    fontSize: fontSize.small,
    fontWeight: '700',
    color: colors.accentDark,
  },
  term: {
    marginTop: spacing.md,
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
  },
  meaning: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    fontSize: fontSize.subtitle,
    lineHeight: 26,
    color: colors.text,
  },
  card: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    marginLeft: spacing.sm,
    fontSize: fontSize.body,
    fontWeight: '800',
    color: colors.primary,
  },
  cardText: {
    fontSize: fontSize.body,
    lineHeight: 24,
    color: colors.text,
  },
  example: {
    fontSize: fontSize.body,
    lineHeight: 24,
    fontStyle: 'italic',
    color: colors.text,
  },
  tipCard: {
    backgroundColor: colors.accentSoft,
    shadowOpacity: 0,
    elevation: 0,
  },
  tipTitle: {
    color: colors.accentDark,
  },
});
