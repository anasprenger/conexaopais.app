import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { ROLES, useAuth } from '../../contexts/AuthContext';
import { colors, fonts, spacing, type } from '../../theme';
import { isValidEmail } from '../../utils/validation';

const tiposDeConta = [
  { id: ROLES.USUARIO, label: 'Responsável / família' },
  { id: ROLES.PROFISSIONAL, label: 'Profissional' },
];

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    tipo: ROLES.USUARIO,
    profissao: '',
    registro: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});
  const isProfissional = form.tipo === ROLES.PROFISSIONAL;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleRegister() {
    const newErrors = {};
    if (form.name.trim().length < 2) newErrors.name = 'Informe como podemos te chamar.';
    if (!isValidEmail(form.email)) newErrors.email = 'Informe um e-mail válido.';
    if (isProfissional && form.profissao.trim().length < 3) newErrors.profissao = 'Informe sua profissão.';
    if (isProfissional && form.registro.trim().length < 4) newErrors.registro = 'Informe o número de cadastro profissional.';
    if (form.password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    if (form.confirm !== form.password) newErrors.confirm = 'As senhas não conferem.';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      signUp(form);
      navigation.popTo('Login', { registered: form.tipo, email: form.email.trim() });
    }
  }

  return (
    <Screen>
      <Text style={type.h1}>Criar minha conta</Text>
      <Text style={[type.muted, styles.subtitle]}>É gratuito. Faça parte dessa conexão.</Text>

      <TextField
        label="Como podemos te chamar?"
        icon="person-outline"
        placeholder="Seu nome"
        value={form.name}
        onChangeText={(value) => update('name', value)}
        error={errors.name}
      />
      <TextField
        label="E-mail"
        icon="mail-outline"
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(value) => update('email', value)}
        error={errors.email}
      />

      <Text style={styles.label}>Tipo de conta</Text>
      <View style={styles.chips}>
        {tiposDeConta.map((tipo) => (
          <Chip key={tipo.id} label={tipo.label} selected={form.tipo === tipo.id} onPress={() => update('tipo', tipo.id)} />
        ))}
      </View>

      {isProfissional && (
        <>
          <Notice tone="info" style={styles.notice}>
            Nossa equipe confere o seu registro antes de liberar a publicação de artigos.
          </Notice>
          <TextField
            label="Profissão"
            icon="briefcase-outline"
            placeholder="Ex.: Psicóloga, Pediatra, Pedagoga"
            value={form.profissao}
            onChangeText={(value) => update('profissao', value)}
            error={errors.profissao}
          />
          <TextField
            label="Número de cadastro profissional"
            icon="ribbon-outline"
            placeholder="Ex.: CRP 07/123456, CRM/RS 12345"
            autoCapitalize="characters"
            value={form.registro}
            onChangeText={(value) => update('registro', value)}
            error={errors.registro}
          />
        </>
      )}

      <TextField
        label="Senha"
        icon="lock-closed-outline"
        placeholder="Mínimo de 6 caracteres"
        secure
        value={form.password}
        onChangeText={(value) => update('password', value)}
        error={errors.password}
        style={styles.password}
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

      <Button title="Criar minha conta" variant="accent" onPress={handleRegister} />

      <Pressable style={styles.link} onPress={() => navigation.popTo('Login')}>
        <Text style={styles.linkText}>Já tenho uma conta</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  notice: {
    marginTop: spacing.sm,
  },
  password: {
    marginTop: spacing.sm,
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
});
