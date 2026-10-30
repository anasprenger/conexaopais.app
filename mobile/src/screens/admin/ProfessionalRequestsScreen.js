import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import SegmentedControl from '../../components/SegmentedControl';
import TextField from '../../components/TextField';
import { ROLES, useAuth, verificacaoLabels } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { colors, radius, spacing, type } from '../../theme';

const tone = { pendente: 'warning', aprovado: 'success', ajustes_solicitados: 'warning', recusado: 'danger' };

// Somente administração: verificação das contas profissionais (como "Novos profissionais" no site)
export default function ProfessionalRequestsScreen() {
  const { users, reviewProfessional } = useAuth();
  const confirm = useConfirm();
  const [filtro, setFiltro] = useState('pendente');
  const [ajusteDe, setAjusteDe] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState(null);

  const profissionais = users.filter((item) => item.role === ROLES.PROFISSIONAL);
  const contagem = (status) => profissionais.filter((item) => item.verificacao === status).length;
  const lista = profissionais.filter((item) =>
    filtro === 'pendente' ? ['pendente', 'ajustes_solicitados'].includes(item.verificacao) : item.verificacao === filtro
  );

  function decidir(pessoa, verificacao, mensagem, texto = '') {
    reviewProfessional(pessoa.id, verificacao, texto);
    setAviso(mensagem);
    setAjusteDe(null);
    setObservacao('');
    setErro('');
  }

  function enviarAjustes(pessoa) {
    if (observacao.trim().length < 10) {
      setErro('Escreva uma orientação com pelo menos 10 caracteres.');
      return;
    }
    decidir(pessoa, 'ajustes_solicitados', 'Orientações enviadas.', observacao.trim());
  }

  return (
    <Screen>
      <Text style={[type.muted, styles.intro]}>
        Confira profissão e número de registro antes de liberar a publicação de artigos.
      </Text>

      <SegmentedControl
        options={[
          { id: 'pendente', label: `A analisar (${contagem('pendente') + contagem('ajustes_solicitados')})` },
          { id: 'aprovado', label: 'Aprovados' },
          { id: 'recusado', label: 'Recusados' },
        ]}
        value={filtro}
        onChange={(value) => {
          setFiltro(value);
          setAviso(null);
        }}
      />

      {aviso && <Notice tone="success" title={aviso} />}
      {lista.length === 0 && <EmptyState icon="people-outline" title="Nenhum cadastro nesta situação." />}

      {lista.map((pessoa) => (
        <View key={pessoa.id} style={styles.card}>
          <View style={styles.header}>
            <Avatar name={pessoa.name} size={48} />
            <View style={styles.headerText}>
              <Text style={type.h3}>{pessoa.name}</Text>
              <Text style={type.small}>{pessoa.email}</Text>
            </View>
          </View>
          <Text style={[type.body, styles.line]}>{pessoa.profissao || 'Profissão não informada'}</Text>
          <Text style={type.small}>Registro: {pessoa.registro || 'não informado'}</Text>
          <View style={styles.badge}>
            <Badge label={verificacaoLabels[pessoa.verificacao]} tone={tone[pessoa.verificacao]} />
          </View>
          {pessoa.observacao ? <Text style={[type.small, styles.line]}>Orientação enviada: {pessoa.observacao}</Text> : null}

          {['pendente', 'ajustes_solicitados'].includes(pessoa.verificacao) && (
            <>
              {ajusteDe === pessoa.id && (
                <View style={styles.adjust}>
                  <TextField
                    label="O que precisa ser corrigido?"
                    placeholder="Explique quais dados precisam ser corrigidos"
                    multiline
                    value={observacao}
                    onChangeText={setObservacao}
                    error={erro}
                  />
                  <Button title="Enviar orientações" variant="outline" small onPress={() => enviarAjustes(pessoa)} />
                </View>
              )}
              <View style={styles.actions}>
                <Button
                  title="Aprovar"
                  icon="checkmark"
                  small
                  onPress={() => decidir(pessoa, 'aprovado', `${pessoa.name}: profissional aprovado.`)}
                />
                {ajusteDe !== pessoa.id && (
                  <Button
                    title="Pedir ajustes"
                    variant="outline"
                    small
                    onPress={() => {
                      setAjusteDe(pessoa.id);
                      setErro('');
                    }}
                  />
                )}
                <Button
                  title="Recusar"
                  variant="danger"
                  small
                  onPress={() =>
                    confirm({
                      title: 'Recusar cadastro',
                      message: `Recusar o cadastro profissional de ${pessoa.name}?`,
                      confirmLabel: 'Recusar',
                      onConfirm: () => decidir(pessoa, 'recusado', 'Cadastro recusado.'),
                    })
                  }
                />
              </View>
            </>
          )}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  line: {
    marginTop: spacing.md,
  },
  badge: {
    marginTop: spacing.sm,
  },
  adjust: {
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
