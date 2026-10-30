import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import CategoryBadge from '../../components/CategoryBadge';
import EmptyState from '../../components/EmptyState';
import ExpressionCard from '../../components/ExpressionCard';
import Screen from '../../components/Screen';
import StatusBadge from '../../components/StatusBadge';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useExpressions } from '../../contexts/ExpressionsContext';
import { useSuggestions } from '../../contexts/SuggestionsContext';
import { colors, fontSize, radius, shadow, spacing } from '../../theme';

// Painel exclusivo do administrador: CRUD de expressões e moderação de sugestões
export default function AdminPanelScreen({ navigation }) {
  const { expressions, deleteExpression } = useExpressions();
  const { suggestions, updateSuggestionStatus } = useSuggestions();
  const confirm = useConfirm();
  const [tab, setTab] = useState('expressions');

  const pending = suggestions.filter((suggestion) => suggestion.status === 'pendente');
  const sortedExpressions = [...expressions].sort((a, b) => a.term.localeCompare(b.term));

  function handleDelete(expression) {
    confirm({
      title: 'Excluir expressão',
      message: `Tem certeza que deseja excluir "${expression.term}"?`,
      confirmLabel: 'Excluir',
      onConfirm: () => deleteExpression(expression.id),
    });
  }

  function handleReject(suggestion) {
    confirm({
      title: 'Recusar sugestão',
      message: `Recusar a sugestão "${suggestion.term}"?`,
      confirmLabel: 'Recusar',
      onConfirm: () => updateSuggestionStatus(suggestion.id, 'recusada'),
    });
  }

  const stats = [
    { label: 'Expressões', value: expressions.length, icon: 'book' },
    { label: 'Pendentes', value: pending.length, icon: 'time' },
    { label: 'Sugestões', value: suggestions.length, icon: 'bulb' },
  ];

  return (
    <Screen>
      <View style={styles.notice}>
        <Ionicons name="shield-checkmark" size={20} color={colors.accentDark} />
        <Text style={styles.noticeText}>
          Área restrita a administradores. Na Entrega 3 o back-end também vai validar o nível pelo JWT.
        </Text>
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Ionicons name={stat.icon} size={18} color={colors.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.segment}>
        {[
          { id: 'expressions', label: 'Expressões' },
          { id: 'suggestions', label: `Sugestões (${pending.length})` },
        ].map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setTab(item.id)}
            style={[styles.segmentItem, tab === item.id && styles.segmentActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === item.id }}
          >
            <Text style={[styles.segmentText, tab === item.id && styles.segmentTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'expressions' ? (
        <>
          <Button
            title="Nova expressão"
            icon="add-circle-outline"
            onPress={() => navigation.navigate('ExpressionForm')}
            style={styles.newButton}
          />
          {sortedExpressions.map((expression) => (
            <ExpressionCard
              key={expression.id}
              expression={expression}
              onPress={() => navigation.navigate('ExpressionDetail', { id: expression.id })}
              actions={
                <>
                  <Button
                    title="Editar"
                    icon="create-outline"
                    variant="outline"
                    small
                    onPress={() => navigation.navigate('ExpressionForm', { id: expression.id })}
                  />
                  <Button
                    title="Excluir"
                    icon="trash-outline"
                    variant="danger"
                    small
                    onPress={() => handleDelete(expression)}
                  />
                </>
              }
            />
          ))}
        </>
      ) : suggestions.length === 0 ? (
        <EmptyState icon="bulb-outline" title="Nenhuma sugestão recebida" />
      ) : (
        suggestions.map((suggestion) => (
          <View key={suggestion.id} style={styles.suggestion}>
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionTerm}>{suggestion.term}</Text>
              <StatusBadge status={suggestion.status} />
            </View>
            {suggestion.category && <CategoryBadge category={suggestion.category} />}
            <Text style={styles.suggestionContext}>"{suggestion.context}"</Text>
            <Text style={styles.suggestionAuthor}>Enviada por {suggestion.author}</Text>
            {suggestion.status === 'pendente' && (
              <View style={styles.suggestionActions}>
                <Button
                  title="Recusar"
                  icon="close"
                  variant="danger"
                  small
                  onPress={() => handleReject(suggestion)}
                />
                <Button
                  title="Aprovar e cadastrar"
                  icon="checkmark"
                  small
                  onPress={() => navigation.navigate('ExpressionForm', { suggestionId: suggestion.id })}
                />
              </View>
            )}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  noticeText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.small,
    lineHeight: 20,
    color: colors.text,
  },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow,
  },
  statValue: {
    marginTop: spacing.xs,
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  segment: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...shadow,
  },
  segmentText: {
    fontSize: fontSize.small,
    fontWeight: '700',
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.primary,
  },
  newButton: {
    marginBottom: spacing.md,
  },
  suggestion: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  suggestionTerm: {
    flex: 1,
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  suggestionContext: {
    marginTop: spacing.sm,
    fontSize: fontSize.small,
    lineHeight: 20,
    fontStyle: 'italic',
    color: colors.text,
  },
  suggestionAuthor: {
    marginTop: spacing.xs,
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  suggestionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
