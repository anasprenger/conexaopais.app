import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '../theme';
import Button from './Button';

// Aparece no lugar de um formulário quando a pessoa ainda não entrou (ex.: comentar)
export default function ConviteLogin({ title = 'Faça parte dessa conexão.', message, style }) {
  const navigation = useNavigation();

  return (
    <View style={[styles.card, style]}>
      <Text style={type.h3}>{title}</Text>
      {message && <Text style={[type.muted, styles.message]}>{message}</Text>}
      <View style={styles.actions}>
        <Button title="Entrar" icon="log-in-outline" small onPress={() => navigation.navigate('Login')} />
        <Button title="Criar minha conta" variant="outline" small onPress={() => navigation.navigate('Register')} style={styles.secondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.mintSoft,
  },
  message: {
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondary: {
    backgroundColor: colors.card,
  },
});
