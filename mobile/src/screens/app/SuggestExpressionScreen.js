import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAuth } from '../../contexts/AuthContext';
import { useSuggestions } from '../../contexts/SuggestionsContext';
import { categories } from '../../data/categories';
import { categoryStyles, colors, fontSize, spacing } from '../../theme';

export default function SuggestExpressionScreen({ navigation, route }) {
  const { user } = useAuth();
  const { addSuggestion } = useSuggestions();

  const [term, setTerm] = useState(route.params?.term ?? '');
  const [category, setCategory] = useState(null);
  const [context, setContext] = useState('');
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    const newErrors = {};
    if (!term.trim()) newErrors.term = 'Informe a expressão.';
    if (context.trim().length < 10) newErrors.context = 'Conte um pouco mais (mínimo de 10 caracteres).';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      addSuggestion({ term, category, context, author: user });
      setSent(true);
    }
  }

  function reset() {
    setTerm('');
    setCategory(null);
    setContext('');
    setSent(false);
  }

  if (sent) {
    return (
      <Screen contentStyle={styles.center}>
        <EmptyState
          icon="paper-plane"
          title="Sugestão enviada!"
          message="Nossa equipe vai pesquisar a expressão e publicar a explicação. Acompanhe o status no seu perfil."
        >
          <Button title="Voltar" icon="arrow-back" onPress={() => navigation.goBack()} />
          <Button title="Sugerir outra" variant="ghost" onPress={reset} style={styles.again} />
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.intro}>
        Ouviu uma palavra, meme ou sigla que não conhece? Conte pra gente! Um administrador vai revisar a sugestão
        antes de publicá-la no glossário.
      </Text>

      <TextField
        label="Expressão"
        icon="text"
        placeholder="Ex.: farmar aura"
        value={term}
        onChangeText={setTerm}
        error={errors.term}
      />

      <Text style={styles.label}>Categoria (opcional)</Text>
      <View style={styles.chips}>
        {categories.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            color={categoryStyles[item.id].color}
            soft={categoryStyles[item.id].soft}
            selected={category === item.id}
            onPress={() => setCategory(category === item.id ? null : item.id)}
          />
        ))}
      </View>

      <TextField
        label="Onde ou como você ouviu?"
        placeholder="Conte o contexto: quem falou, em que situação, em qual rede social…"
        multiline
        value={context}
        onChangeText={setContext}
        error={errors.context}
        style={styles.context}
      />

      <Button title="Enviar sugestão" icon="paper-plane-outline" onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
  },
  intro: {
    marginBottom: spacing.lg,
    fontSize: fontSize.body,
    lineHeight: 22,
    color: colors.textMuted,
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
  context: {
    marginTop: spacing.sm,
  },
  again: {
    marginTop: spacing.sm,
  },
});
