import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import ExpressionCard from '../../components/ExpressionCard';
import TextField from '../../components/TextField';
import { useExpressions } from '../../contexts/ExpressionsContext';
import { categories } from '../../data/categories';
import { categoryStyles, colors, fontSize, spacing } from '../../theme';
import { normalize } from '../../utils/text';

export default function GlossaryScreen({ navigation, route }) {
  const { expressions } = useExpressions();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(route.params?.category ?? null);

  // Permite abrir o glossário já filtrado (ex.: tocando em uma categoria na tela Início).
  // Cada navegação cria um novo objeto de params, então o filtro é reaplicado mesmo na mesma categoria.
  useEffect(() => {
    if (route.params && 'category' in route.params) setCategory(route.params.category);
  }, [route.params]);

  const search = normalize(query);
  const results = expressions.filter((expression) => {
    const matchesCategory = !category || expression.category === category;
    const matchesSearch =
      !search || normalize(expression.term).includes(search) || normalize(expression.meaning).includes(search);
    return matchesCategory && matchesSearch;
  });

  const header = (
    <View>
      <TextField
        icon="search"
        placeholder="Buscar gíria, meme ou sigla…"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        returnKeyType="search"
        style={styles.search}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        <Chip label="Todas" selected={!category} onPress={() => setCategory(null)} />
        {categories.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            icon={categoryStyles[item.id].icon}
            color={categoryStyles[item.id].color}
            soft={categoryStyles[item.id].soft}
            selected={category === item.id}
            onPress={() => setCategory(item.id)}
          />
        ))}
      </ScrollView>
      <Text style={styles.count}>
        {results.length} {results.length === 1 ? 'expressão encontrada' : 'expressões encontradas'}
      </Text>
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={results}
      keyExtractor={(item) => String(item.id)}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <ExpressionCard expression={item} onPress={() => navigation.navigate('ExpressionDetail', { id: item.id })} />
      )}
      ListEmptyComponent={
        <EmptyState
          title={query ? `Não encontramos "${query}"` : 'Nenhuma expressão nesta categoria'}
          message="Que tal sugerir essa expressão? Nossa equipe pesquisa e explica para você."
        >
          <Button
            title="Sugerir expressão"
            icon="add-circle-outline"
            small
            onPress={() => navigation.navigate('SuggestExpression', { term: query })}
          />
        </EmptyState>
      }
      ListFooterComponent={
        results.length > 0 && (
          <Pressable style={styles.footer} onPress={() => navigation.navigate('SuggestExpression', { term: query })}>
            <Text style={styles.footerText}>
              Não encontrou o que procurava? <Text style={styles.footerLink}>Sugira uma expressão</Text>
            </Text>
          </Pressable>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  search: {
    marginBottom: spacing.sm,
  },
  chips: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  count: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: fontSize.small,
    color: colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  footerText: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: '700',
    color: colors.primary,
  },
});
