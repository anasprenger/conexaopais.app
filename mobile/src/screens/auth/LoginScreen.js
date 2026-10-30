import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { DEMO_ACCOUNTS, useAuth } from '../../contexts/AuthContext';
import { colors, fonts, radius, spacing, type } from '../../theme';
import { isValidEmail } from '../../utils/validation';

const demoProfiles = [
  { id: 'usuario', label: 'Família', icon: 'home-outline' },
  { id: 'profissional', label: 'Profissional', icon: 'medkit-outline' },
  { id: 'admin', label: 'Administração', icon: 'shield-checkmark-outline' },
];

export default function LoginScreen({ navigation, route }) {
  const { signIn } = useAuth();
  const registered = route.params?.registered;

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

  function fillDemo(profile) {
    setEmail(DEMO_ACCOUNTS[profile].email);
    setPassword(DEMO_ACCOUNTS[profile].password);
    setErrors({});
  }

  return (
    <Screen>
      <Text style={type.h1}>Entrar na sua conta</Text>
      <Text style={[type.muted, styles.subtitle]}>
        Acesse sua conta para salvar conteúdos, comentar e conversar com profissionais.
      </Text>

      {registered === 'usuario' && <Notice tone="success" title="Conta criada! Agora é só entrar." />}
      {registered === 'profissional' && (
        <Notice tone="success" title="Conta criada!">
          Nossa equipe vai conferir seu registro profissional antes de liberar as publicações.
        </Notice>
      )}

      <TextField
        label="E-mail"
        icon="mail-outline"
        placeholder="voce@email.com"
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

      <Button title="Entrar" onPress={handleLogin} />

      <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Ainda não tenho conta</Text>
      </Pressable>

      <View style={styles.demo}>
        <View style={styles.demoHeader}>
          <Ionicons name="flask-outline" size={18} color={colors.accentDark} />
          <Text style={styles.demoTitle}>Modo demonstração</Text>
        </View>
        <Text style={type.small}>
          Nesta versão o login é simulado. A autenticação com API, senha criptografada e JWT chega na Entrega 3.
          Escolha um perfil para testar:
        </Text>
        <View style={styles.demoButtons}>
          {demoProfiles.map((profile) => (
            <Button
              key={profile.id}
              title={profile.label}
              icon={profile.icon}
              variant="outline"
              small
              onPress={() => fillDemo(profile.id)}
              style={styles.demoButton}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  link: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  linkText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.primary,
  },
  demo: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  demoTitle: {
    marginLeft: 6,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.accentDark,
  },
  demoButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  demoButton: {
    backgroundColor: colors.card,
  },
});
