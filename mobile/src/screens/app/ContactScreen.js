import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAuth } from '../../contexts/AuthContext';
import { spacing, type } from '../../theme';
import { isValidEmail } from '../../utils/validation';

export default function ContactScreen() {
  const { user } = useAuth();
  const [form, setForm] = useState({ nome: user.name, email: user.email, assunto: '', mensagem: '' });
  const [errors, setErrors] = useState({});
  const [enviada, setEnviada] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setEnviada(false);
  }

  function enviar() {
    const newErrors = {};
    if (!form.nome.trim()) newErrors.nome = 'Informe seu nome.';
    if (!isValidEmail(form.email)) newErrors.email = 'Informe um e-mail válido.';
    if (form.mensagem.trim().length < 10) newErrors.mensagem = 'Escreva sua mensagem (mínimo de 10 caracteres).';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setForm((current) => ({ ...current, assunto: '', mensagem: '' }));
      setEnviada(true);
    }
  }

  return (
    <Screen>
      <Text style={type.eyebrow}>Contato</Text>
      <Text style={[type.h1, styles.title]}>Vamos conversar</Text>
      <Text style={[type.muted, styles.text]}>
        Dúvidas, sugestões, parcerias ou interesse em ser um profissional parceiro: escreva para a gente.
      </Text>

      {enviada && (
        <Notice tone="success" title="Mensagem enviada">
          Nossa equipe responde em breve.
        </Notice>
      )}

      <TextField label="Nome" placeholder="Como podemos te chamar?" value={form.nome} onChangeText={(v) => update('nome', v)} error={errors.nome} />
      <TextField
        label="E-mail"
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(v) => update('email', v)}
        error={errors.email}
      />
      <TextField label="Assunto" placeholder="Como podemos ajudar?" value={form.assunto} onChangeText={(v) => update('assunto', v)} />
      <TextField
        label="Mensagem"
        placeholder="Escreva sua mensagem..."
        multiline
        value={form.mensagem}
        onChangeText={(v) => update('mensagem', v)}
        error={errors.mensagem}
      />
      <Button title="Enviar mensagem" icon="send-outline" variant="accent" onPress={enviar} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.sm,
  },
  text: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
