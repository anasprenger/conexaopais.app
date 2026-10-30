import { StyleSheet, Text } from 'react-native';
import Screen from '../../components/Screen';
import { useAuth } from '../../contexts/AuthContext';
import { colors, fontSize, spacing } from '../../theme';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <Screen>
      <Text style={styles.greeting}>Olá, {user.name}!</Text>
      <Text style={styles.text}>O glossário e as dicas de conversa estão chegando.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
  },
  text: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
});
