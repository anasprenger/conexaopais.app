import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncState from '../../components/AsyncState';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import SegmentedControl from '../../components/SegmentedControl';
import { verificacaoLabels } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { avaliarProfissional, listarContasProfissionais } from '../../services/usuariosService';
import { colors, radius, spacing, type } from '../../theme';

const tone = { pendente: 'warning', aprovado: 'success', recusado: 'danger' };

// Somente administração: verificação das contas profissionais. É a mesma lista e a mesma decisão do
// painel "Novos profissionais" do site: o que for aprovado aqui vale no site, e vice-versa.
export default function ProfessionalRequestsScreen() {
  const confirm = useConfirm();
  const { data: profissionais, loading, error, reload } = useApi(() => listarContasProfissionais(), []);
  const [filtro, setFiltro] = useState('pendente');
  const [aviso, setAviso] = useState(null);
  const [salvandoId, setSalvandoId] = useState(null);

  const lista = profissionais ?? [];
  const contagem = (status) => lista.filter((item) => item.verificacao === status).length;
  const visiveis = lista.filter((item) => item.verificacao === filtro);

  // PATCH /api/usuarios/:id/verificacao
  async function decidir(pessoa, verificacao, mensagem) {
    setSalvandoId(pessoa.id);
    setAviso(null);
    try {
      await avaliarProfissional(pessoa.id, verificacao);
      await reload();
      setAviso({ tone: 'success', title: mensagem });
    } catch (falha) {
      setAviso({ tone: 'danger', title: falha.message });
    } finally {
      setSalvandoId(null);
    }
  }

  return (
    <Screen>
      <Text style={[type.muted, styles.intro]}>
        Confira profissão e número de registro antes de liberar a publicação de artigos. A decisão vale também no site.
      </Text>

      <SegmentedControl
        options={[
          { id: 'pendente', label: `A analisar (${contagem('pendente')})` },
          { id: 'aprovado', label: 'Aprovados' },
          { id: 'recusado', label: 'Recusados' },
        ]}
        value={filtro}
        onChange={(value) => {
          setFiltro(value);
          setAviso(null);
        }}
      />

      {aviso && <Notice tone={aviso.tone} title={aviso.title} />}

      <AsyncState loading={loading && !profissionais} error={error} onRetry={reload}>
        {visiveis.length === 0 && <EmptyState icon="people-outline" title="Nenhum cadastro nesta situação." />}

        {visiveis.map((pessoa) => (
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
              <Badge label={verificacaoLabels[pessoa.verificacao] ?? pessoa.verificacao} tone={tone[pessoa.verificacao]} />
            </View>

            <View style={styles.actions}>
              {pessoa.verificacao !== 'aprovado' && (
                <Button
                  title="Aprovar"
                  icon="checkmark"
                  small
                  disabled={salvandoId === pessoa.id}
                  onPress={() => decidir(pessoa, 'aprovado', `${pessoa.name}: profissional aprovado.`)}
                />
              )}
              {pessoa.verificacao !== 'recusado' && (
                <Button
                  title="Recusar"
                  variant="danger"
                  small
                  disabled={salvandoId === pessoa.id}
                  onPress={() =>
                    confirm({
                      title: 'Recusar cadastro',
                      message: `Recusar o cadastro profissional de ${pessoa.name}? A pessoa deixa de poder publicar.`,
                      confirmLabel: 'Recusar',
                      onConfirm: () => decidir(pessoa, 'recusado', 'Cadastro recusado.'),
                    })
                  }
                />
              )}
            </View>
          </View>
        ))}
      </AsyncState>
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
