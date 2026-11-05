import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../theme';
import Button from './Button';
import EmptyState from './EmptyState';

// Mostra "carregando" ou o erro da API (com botão para tentar de novo); senão, o conteúdo
export default function AsyncState({ loading, error, onRetry, children, compact = false }) {
  if (error) {
    return (
      <EmptyState icon="cloud-offline-outline" title="Não foi possível carregar" message={error.message}>
        {onRetry && <Button title="Tentar de novo" icon="refresh" variant="outline" small onPress={onRetry} />}
      </EmptyState>
    );
  }
  if (loading) {
    return (
      <View style={[styles.loading, compact && styles.compact]} accessibilityLabel="Carregando">
        <ActivityIndicator color={colors.primary} />
        {!compact && <Text style={[type.small, styles.text]}>Carregando…</Text>}
      </View>
    );
  }
  return children;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  compact: {
    paddingVertical: spacing.md,
  },
  text: {
    marginTop: spacing.sm,
  },
});
