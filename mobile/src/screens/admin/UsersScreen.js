import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import AsyncState from '../../components/AsyncState';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { ROLES, useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { definirPapel, definirSuspensao, excluirConta, listarUsuarios } from '../../services/usuariosService';
import { colors, radius, spacing, type } from '../../theme';

// Mesmos filtros da página "Usuários" do site
const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: ROLES.ADMIN, label: 'Administração' },
  { id: ROLES.PROFISSIONAL, label: 'Profissionais' },
  { id: ROLES.USUARIO, label: 'Famílias' },
  { id: 'suspensa', label: 'Suspensas' },
];

const tipoLabel = {
  [ROLES.ADMIN]: 'Administração',
  [ROLES.PROFISSIONAL]: 'Profissional',
  [ROLES.USUARIO]: 'Família',
};
const tipoTone = { [ROLES.ADMIN]: 'primary', [ROLES.PROFISSIONAL]: 'accent', [ROLES.USUARIO]: 'mint' };

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function data(valor) {
  if (!valor) return 'nunca';
  const d = new Date(valor);
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

// Tira acentos para a busca achar "Jose" e "José"
function normalizar(texto) {
  return (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Somente administração: todas as contas do site e do app. É a mesma lista e as mesmas ações da página
// "Usuários" do site: mudar o tipo de conta, suspender ou reativar e excluir. O que mudar aqui vale no site.
export default function UsersScreen() {
  const { user } = useAuth();
  const confirm = useConfirm();
  // GET /api/usuarios
  const { data: usuarios, loading, error, reload } = useApi(() => listarUsuarios(), [], { recarregarAoFocar: true });
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [aviso, setAviso] = useState(null);
  const [ocupadoId, setOcupadoId] = useState(null);

  const lista = usuarios ?? [];
  const contagem = useMemo(() => {
    const total = { todos: lista.length, suspensa: 0, [ROLES.ADMIN]: 0, [ROLES.PROFISSIONAL]: 0, [ROLES.USUARIO]: 0 };
    for (const pessoa of lista) {
      total[pessoa.role] += 1;
      if (pessoa.suspensa) total.suspensa += 1;
    }
    return total;
  }, [lista]);

  const termo = normalizar(busca.trim());
  const visiveis = lista
    .filter((pessoa) => (filtro === 'suspensa' ? pessoa.suspensa : filtro === 'todos' || pessoa.role === filtro))
    .filter((pessoa) => !termo || normalizar(pessoa.name).includes(termo) || normalizar(pessoa.email).includes(termo))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  async function executar(pessoa, acao, mensagem) {
    setOcupadoId(pessoa.id);
    setAviso(null);
    try {
      await acao();
      await reload();
      setAviso({ tone: 'success', title: mensagem });
    } catch (falha) {
      setAviso({ tone: 'danger', title: falha.message });
    } finally {
      setOcupadoId(null);
    }
  }

  // PATCH /api/usuarios/:id/papel
  function alternarPapel(pessoa, papel) {
    const ativo = !pessoa.papeis.includes(papel);
    const nomePapel = papel === ROLES.ADMIN ? 'administração' : 'profissional';
    const fazer = () =>
      executar(
        pessoa,
        () => definirPapel(pessoa.id, papel, ativo),
        ativo ? `${pessoa.name} agora é ${nomePapel}.` : `${pessoa.name} deixou de ser ${nomePapel}.`
      );
    if (papel === ROLES.ADMIN && ativo) {
      confirm({
        title: 'Tornar administração',
        message: `${pessoa.name} vai poder gerenciar contas e conteúdos do site e do app.`,
        confirmLabel: 'Confirmar',
        tone: 'primary',
        onConfirm: fazer,
      });
    } else {
      fazer();
    }
  }

  // PATCH /api/usuarios/:id/suspensao
  function alternarSuspensao(pessoa) {
    const suspensa = !pessoa.suspensa;
    const fazer = () =>
      executar(pessoa, () => definirSuspensao(pessoa.id, suspensa), suspensa ? 'Conta suspensa.' : 'Conta reativada.');
    if (suspensa) {
      confirm({
        title: 'Suspender conta',
        message: `${pessoa.name} não vai conseguir entrar no site nem no app até a conta ser reativada.`,
        confirmLabel: 'Suspender',
        onConfirm: fazer,
      });
    } else {
      fazer();
    }
  }

  // DELETE /api/usuarios/:id
  function excluir(pessoa) {
    confirm({
      title: `Excluir a conta de ${pessoa.name}?`,
      message:
        'Não dá para desfazer: somem a conta, as publicações, os comentários e os salvos, no app e no site. Se quiser só impedir o acesso, use Suspender.',
      confirmLabel: 'Excluir de vez',
      onConfirm: () => executar(pessoa, () => excluirConta(pessoa.id), 'Conta excluída.'),
    });
  }

  return (
    <Screen>
      <Text style={[type.muted, styles.intro]}>
        Todas as contas do site e do app. As mudanças valem nos dois na hora.
      </Text>

      <TextField
        icon="search"
        placeholder="Buscar por nome ou e-mail"
        value={busca}
        onChangeText={setBusca}
        autoCapitalize="none"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {FILTROS.map((item) => (
          <Chip
            key={item.id}
            label={`${item.label} (${contagem[item.id]})`}
            selected={filtro === item.id}
            onPress={() => setFiltro(item.id)}
          />
        ))}
      </ScrollView>

      {aviso && <Notice tone={aviso.tone} title={aviso.title} />}

      <AsyncState loading={loading && !usuarios} error={error} onRetry={reload}>
        {visiveis.length === 0 && <EmptyState icon="people-outline" title="Nenhuma conta encontrada." />}

        {visiveis.map((pessoa) => {
          const souEu = pessoa.id === user.id;
          const ocupado = ocupadoId === pessoa.id;
          const ehAdmin = pessoa.papeis.includes(ROLES.ADMIN);
          const ehProfissional = pessoa.papeis.includes(ROLES.PROFISSIONAL);
          return (
            <View key={pessoa.id} style={styles.card}>
              <View style={styles.header}>
                <Avatar name={pessoa.name} size={48} tone={ehAdmin ? 'primary' : 'mint'} />
                <View style={styles.headerText}>
                  <Text style={type.h3}>
                    {pessoa.name}
                    {souEu ? ' (você)' : ''}
                  </Text>
                  <Text style={type.small}>{pessoa.email}</Text>
                </View>
              </View>

              <View style={styles.badges}>
                <Badge label={tipoLabel[pessoa.role]} tone={tipoTone[pessoa.role]} />
                <Badge label={pessoa.suspensa ? 'Suspensa' : 'Ativa'} tone={pessoa.suspensa ? 'danger' : 'success'} />
              </View>
              <Text style={[type.small, styles.meta]}>
                Cadastro em {data(pessoa.criadoEm)} · Último acesso: {data(pessoa.ultimoAcesso)}
              </Text>

              <View style={styles.actions}>
                <Button
                  title={ehAdmin ? 'Tirar da administração' : 'Tornar administração'}
                  icon="shield-checkmark-outline"
                  variant={ehAdmin ? 'soft' : 'outline'}
                  small
                  disabled={ocupado || (souEu && ehAdmin)}
                  onPress={() => alternarPapel(pessoa, ROLES.ADMIN)}
                />
                <Button
                  title={ehProfissional ? 'Tirar de profissional' : 'Tornar profissional'}
                  icon="medkit-outline"
                  variant={ehProfissional ? 'soft' : 'outline'}
                  small
                  disabled={ocupado}
                  onPress={() => alternarPapel(pessoa, ROLES.PROFISSIONAL)}
                />
                {!souEu && (
                  <>
                    <Button
                      title={pessoa.suspensa ? 'Reativar conta' : 'Suspender conta'}
                      icon={pessoa.suspensa ? 'lock-open-outline' : 'lock-closed-outline'}
                      variant="ghost"
                      small
                      disabled={ocupado}
                      onPress={() => alternarSuspensao(pessoa)}
                    />
                    <Button
                      title="Excluir conta"
                      icon="trash-outline"
                      variant="danger"
                      small
                      disabled={ocupado}
                      onPress={() => excluir(pessoa)}
                    />
                  </>
                )}
              </View>
              {souEu && (
                <Text style={[type.small, styles.meta]}>Para excluir a sua própria conta, use a aba Conta.</Text>
              )}
            </View>
          );
        })}
      </AsyncState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.md,
  },
  chips: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    flexGrow: 0,
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  meta: {
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
