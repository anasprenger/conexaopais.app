import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { DEMO_ACCOUNTS, useAuth } from '../../contexts/AuthContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { isValidEmail } from '../../utils/validation';

export default function LoginScreen({ navigation, route }) {
  const { signIn } = useAuth();
  const justRegistered = route.params?.registered;

  const [email, setEmail] = useState(route.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  // Ao voltar do cadastro, preenche o e-mail recém-cadastrado
  useEffect(() => {
    if (route.params?.email) setEmail(route.params.email);
  }, [route.params?.email]);

  function handleLogin() {
    const newErrors = {};
    if (!isValidEmail(email)) newErrors.email = 'Informe um e-mail válido.';
    if (password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      signIn(email);
    }
  }

  function fillDemo(account) {
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
  }

  return (
    <Screen>
      <Text style={styles.title}>Que bom te ver!</Text>
      <Text style={styles.subtitle}>Entre para acessar o glossário e as dicas de conversa.</Text>

      {justRegistered && (
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.successText}>Conta criada! Agora é só entrar.</Text>
        </View>
      )}

      <TextField
        label="E-mail"
        icon="mail-outline"
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <TextField
        label="Senha"
        icon="lock-closed-outline"
        placeholder="Sua senha"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />

      <Button title="Entrar" icon="log-in-outline" onPress={handleLogin} />

      <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>
          Ainda não tem conta? <Text style={styles.linkStrong}>Criar conta</Text>
        </Text>
      </Pressable>

      <View style={styles.demo}>
        <View style={styles.demoHeader}>
          <Ionicons name="flask-outline" size={18} color={colors.warning} />
          <Text style={styles.demoTitle}>Modo demonstração</Text>
        </View>
        <Text style={styles.demoText}>
          Nesta versão o login é simulado. A autenticação com API, senha criptografada e JWT chega na
          Entrega 3. Escolha um perfil para testar:
        </Text>
        <View style={styles.demoButtons}>
          <Button
            title="Responsável"
            icon="person-outline"
            variant="outline"
            small
            onPress={() => fillDemo(DEMO_ACCOUNTS.responsavel)}
            style={styles.demoButton}
          />
          <Button
            title="Administrador"
            icon="shield-checkmark-outline"
            variant="outline"
            small
            onPress={() => fillDemo(DEMO_ACCOUNTS.admin)}
            style={styles.demoButton}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  successText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.success,
  },
  link: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  linkText: {
    fontSize: fontSize.small,
    color: colors.textMuted,
  },
  linkStrong: {
    fontWeight: '700',
    color: colors.primary,
  },
  demo: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  demoTitle: {
    marginLeft: 6,
    fontSize: fontSize.small,
    fontWeight: '800',
    color: colors.warning,
  },
  demoText: {
    fontSize: fontSize.small,
    lineHeight: 20,
    color: colors.text,
  },
  demoButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  demoButton: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});
