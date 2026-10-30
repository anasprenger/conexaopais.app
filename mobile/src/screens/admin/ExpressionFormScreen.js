import { useLayoutEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useExpressions } from '../../contexts/ExpressionsContext';
import { useSuggestions } from '../../contexts/SuggestionsContext';
import { categories } from '../../data/categories';
import { categoryStyles, colors, fontSize, radius, spacing } from '../../theme';

const emptyForm = { term: '', category: null, meaning: '', example: '', origin: '', tip: '' };

// Formulário de criação/edição de expressão (somente administrador).
// Recebe { id } para editar ou { suggestionId } para cadastrar a partir de uma sugestão aprovada.
export default function ExpressionFormScreen({ navigation, route }) {
  const { getExpression, saveExpression } = useExpressions();
  const { suggestions, updateSuggestionStatus } = useSuggestions();

  const editing = route.params?.id ? getExpression(route.params.id) : null;
  const suggestion = suggestions.find((item) => item.id === route.params?.suggestionId);

  const [form, setForm] = useState(() => {
    if (editing) return { ...editing };
    if (suggestion) return { ...emptyForm, term: suggestion.term, category: suggestion.category ?? null };
    return emptyForm;
  });
  const [errors, setErrors] = useState({});

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Editar expressão' : 'Nova expressão' });
  }, [navigation, editing]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const newErrors = {};
    if (!form.term.trim()) newErrors.term = 'Informe o termo.';
    if (!form.category) newErrors.category = 'Escolha uma categoria.';
    if (form.meaning.trim().length < 10) newErrors.meaning = 'Explique o significado (mínimo de 10 caracteres).';
    if (!form.example.trim()) newErrors.example = 'Inclua um exemplo de uso.';
    if (form.tip.trim().length < 10) newErrors.tip = 'Inclua uma dica de conversa (mínimo de 10 caracteres).';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    saveExpression({
      ...form,
      term: form.term.trim(),
      meaning: form.meaning.trim(),
      example: form.example.trim(),
      origin: form.origin.trim(),
      tip: form.tip.trim(),
    });
    if (suggestion) updateSuggestionStatus(suggestion.id, 'aprovada');
    navigation.goBack();
  }

  return (
    <Screen>
      {suggestion && (
        <View style={styles.suggestion}>
          <Text style={styles.suggestionTitle}>Sugestão de {suggestion.author}</Text>
          <Text style={styles.suggestionText}>"{suggestion.context}"</Text>
        </View>
      )}

      <TextField
        label="Termo"
        placeholder="Ex.: Cringe"
        value={form.term}
        onChangeText={(value) => update('term', value)}
        error={errors.term}
      />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.chips}>
        {categories.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            icon={categoryStyles[item.id].icon}
            color={categoryStyles[item.id].color}
            soft={categoryStyles[item.id].soft}
            selected={form.category === item.id}
            onPress={() => update('category', item.id)}
          />
        ))}
      </View>
      {errors.category && <Text style={styles.error}>{errors.category}</Text>}

      <TextField
        label="Significado"
        placeholder="O que a expressão quer dizer"
        multiline
        value={form.meaning}
        onChangeText={(value) => update('meaning', value)}
        error={errors.meaning}
        style={styles.firstAfterChips}
      />
      <TextField
        label="Exemplo de uso"
        placeholder='Ex.: "Mãe, isso é muito cringe!"'
        value={form.example}
        onChangeText={(value) => update('example', value)}
        error={errors.example}
      />
      <TextField
        label="De onde vem (opcional)"
        placeholder="Origem da expressão"
        value={form.origin}
        onChangeText={(value) => update('origin', value)}
      />
      <TextField
        label="Como puxar conversa"
        placeholder="Dica para o responsável conversar sobre o tema"
        multiline
        value={form.tip}
        onChangeText={(value) => update('tip', value)}
        error={errors.tip}
      />

      <Button title={editing ? 'Salvar alterações' : 'Cadastrar expressão'} icon="save-outline" onPress={handleSave} />
      <Button title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} style={styles.cancel} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  suggestion: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  suggestionTitle: {
    fontSize: fontSize.small,
    fontWeight: '800',
    color: colors.primary,
  },
  suggestionText: {
    marginTop: spacing.xs,
    fontSize: fontSize.small,
    fontStyle: 'italic',
    color: colors.text,
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  error: {
    fontSize: fontSize.caption,
    color: colors.danger,
  },
  firstAfterChips: {
    marginTop: spacing.sm,
  },
  cancel: {
    marginTop: spacing.sm,
  },
});
