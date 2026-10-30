import { StyleSheet, Text } from 'react-native';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import { roleLabels, useAuth } from '../../contexts/AuthContext';
import { colors, fontSize, spacing } from '../../theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.text}>{user.email}</Text>
      <Text style={styles.text}>Nível: {roleLabels[user.role]}</Text>
      <Button title="Sair" icon="log-out-outline" variant="danger" onPress={signOut} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
  },
  text: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  button: {
    marginTop: spacing.lg,
  },
});
