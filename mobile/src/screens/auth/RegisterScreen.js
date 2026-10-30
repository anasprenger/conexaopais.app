import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAuth } from '../../contexts/AuthContext';
import { colors, fontSize, spacing } from '../../theme';
import { isValidEmail } from '../../utils/validation';

const relations = ['Mãe', 'Pai', 'Avó ou avô', 'Outro responsável', 'Educador(a)'];

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', relation: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleRegister() {
    const newErrors = {};
    if (form.name.trim().length < 3) newErrors.name = 'Informe seu nome.';
    if (!isValidEmail(form.email)) newErrors.email = 'Informe um e-mail válido.';
    if (!form.relation) newErrors.relation = 'Escolha uma opção.';
    if (form.password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    if (form.confirm !== form.password) newErrors.confirm = 'As senhas não conferem.';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      signUp(form);
      navigation.popTo('Login', { registered: true, email: form.email.trim() });
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Crie sua conta</Text>
      <Text style={styles.subtitle}>É rápido e gratuito. Vamos juntos aproximar gerações!</Text>

      <TextField
        label="Nome"
        icon="person-outline"
        placeholder="Como você quer ser chamado(a)"
        value={form.name}
        onChangeText={(value) => update('name', value)}
        error={errors.name}
      />
      <TextField
        label="E-mail"
        icon="mail-outline"
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(value) => update('email', value)}
        error={errors.email}
      />

      <Text style={styles.label}>Você é</Text>
      <View style={styles.chips}>
        {relations.map((relation) => (
          <Chip
            key={relation}
            label={relation}
            selected={form.relation === relation}
            onPress={() => update('relation', relation)}
          />
        ))}
      </View>
      {errors.relation && <Text style={styles.error}>{errors.relation}</Text>}

      <TextField
        label="Senha"
        icon="lock-closed-outline"
        placeholder="Mínimo de 6 caracteres"
        secure
        value={form.password}
        onChangeText={(value) => update('password', value)}
        error={errors.password}
        style={styles.passwordField}
      />
      <TextField
        label="Confirmar senha"
        icon="lock-closed-outline"
        placeholder="Repita a senha"
        secure
        value={form.confirm}
        onChangeText={(value) => update('confirm', value)}
        error={errors.confirm}
      />

      <Button title="Criar conta" icon="person-add-outline" onPress={handleRegister} />

      <Pressable style={styles.link} onPress={() => navigation.popTo('Login')}>
        <Text style={styles.linkText}>
          Já tem conta? <Text style={styles.linkStrong}>Entrar</Text>
        </Text>
      </Pressable>
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
  passwordField: {
    marginTop: spacing.sm,
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
});
