import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { useAuth } from '../../contexts/AuthContext';
import { categories } from '../../data/categories';
import { getFeaturedExpression } from '../../data/expressions';
import { getTipOfTheDay } from '../../data/tips';
import { categoryStyles, colors, fontSize, radius, shadow, spacing } from '../../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const featured = getFeaturedExpression();
  const tip = getTipOfTheDay();
  const firstName = user.name.split(' ')[0];

  return (
    <Screen>
      <Text style={styles.greeting}>Olá, {firstName}!</Text>
      <Text style={styles.subtitle}>O que você quer entender hoje?</Text>

      <Pressable
        style={styles.search}
        onPress={() => navigation.navigate('Glossary', { category: null })}
        accessibilityRole="search"
      >
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <Text style={styles.searchText}>Buscar gíria, meme ou sigla…</Text>
      </Pressable>

      <View style={styles.featured}>
        <Text style={styles.featuredLabel}>EXPRESSÃO DO DIA</Text>
        <Text style={styles.featuredTerm}>{featured.term}</Text>
        <Text style={styles.featuredMeaning} numberOfLines={3}>
          {featured.meaning}
        </Text>
        <Button
          title="Ver explicação"
          variant="accent"
          small
          icon="arrow-forward"
          onPress={() => navigation.navigate('ExpressionDetail', { id: featured.id })}
          style={styles.featuredButton}
        />
      </View>

      <SectionHeader
        title="Explore por categoria"
        actionLabel="Ver todas"
        onAction={() => navigation.navigate('Glossary', { category: null })}
      />
      <View style={styles.categories}>
        {categories.map((category, index) => {
          const style = categoryStyles[category.id];
          return (
            <Pressable
              key={category.id}
              style={[styles.category, index % 3 === 2 && styles.categoryLast]}
              onPress={() => navigation.navigate('Glossary', { category: category.id })}
              accessibilityRole="button"
            >
              <View style={[styles.categoryIcon, { backgroundColor: style.soft }]}>
                <Ionicons name={style.icon} size={22} color={style.color} />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={2}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Dica do dia" actionLabel="Mais dicas" onAction={() => navigation.navigate('Tips')} />
      <Pressable style={styles.tip} onPress={() => navigation.navigate('Tips')}>
        <View style={styles.tipIcon}>
          <Ionicons name={tip.icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipSummary}>{tip.summary}</Text>
        </View>
      </Pressable>

      <View style={styles.suggest}>
        <Ionicons name="ear-outline" size={28} color={colors.accentDark} />
        <Text style={styles.suggestTitle}>Ouviu algo que não entendeu?</Text>
        <Text style={styles.suggestText}>Sugira a expressão e nossa equipe pesquisa e explica para você.</Text>
        <Button
          title="Sugerir expressão"
          variant="outline"
          small
          icon="add-circle-outline"
          onPress={() => navigation.navigate('SuggestExpression')}
          style={styles.suggestButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  featured: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  featuredLabel: {
    fontSize: fontSize.caption,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.accentSoft,
  },
  featuredTerm: {
    marginTop: spacing.xs,
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.textOnPrimary,
  },
  featuredMeaning: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    lineHeight: 22,
    color: colors.primarySoft,
  },
  featuredButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  category: {
    width: '31%',
    marginRight: '3.5%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow,
  },
  categoryLast: {
    marginRight: 0,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginRight: spacing.md,
  },
  tipTitle: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  tipSummary: {
    marginTop: 2,
    fontSize: fontSize.small,
    color: colors.textMuted,
  },
  suggest: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
  },
  suggestTitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  suggestText: {
    marginTop: spacing.xs,
    fontSize: fontSize.small,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  suggestButton: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
  },
});
