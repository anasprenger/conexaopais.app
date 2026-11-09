import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ArticleCard from '../../components/ArticleCard';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { ROLES, roleLabels, useAuth, verificacaoLabels } from '../../contexts/AuthContext';
import { useCommunity } from '../../contexts/CommunityContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useContent } from '../../contexts/ContentContext';
import { useApi } from '../../hooks/useApi';
import { listarContasProfissionais } from '../../services/usuariosService';
import { colors, fonts, radius, shadow, spacing, type } from '../../theme';

const verificacaoTone = { pendente: 'warning', aprovado: 'success', ajustes_solicitados: 'warning', recusado: 'danger' };

// Aba Conta: dados da conta para quem entrou; convite para entrar ou criar conta para visitantes
export default function AccountScreen({ navigation }) {
  const { user } = useAuth();
  return user ? <ContaLogada navigation={navigation} /> : <ContaVisitante navigation={navigation} />;
}

function ContaVisitante({ navigation }) {
  const { sessaoExpirada } = useAuth();
  return (
    <Screen>
      {sessaoExpirada && (
        <Notice tone="warning" title="Sua sessão expirou.">
          Entre de novo para curtir, salvar, comentar e publicar.
        </Notice>
      )}
      <View style={styles.guest}>
        <Logo size={72} showName={false} />
        <Text style={[type.h1, styles.guestTitle]}>Faça parte dessa conexão.</Text>
        <Text style={[type.muted, styles.guestText]}>
          Você já pode ler artigos, colunas e a revista e conhecer os profissionais. Com uma conta, também pode curtir,
          salvar, comentar e perguntar à equipe.
        </Text>
      </View>
      <Button title="Entrar" icon="log-in-outline" onPress={() => navigation.navigate('Login')} />
      <Button
        title="Criar minha conta"
        variant="outline"
        onPress={() => navigation.navigate('Register')}
        style={styles.guestSecondary}
      />
      <LinksInstitucionais navigation={navigation} />
    </Screen>
  );
}

function LinksInstitucionais({ navigation }) {
  return (
    <>
      <SectionHeader title="Conexão Pais" />
      <Pressable style={styles.row} onPress={() => navigation.navigate('About')} accessibilityRole="button">
        <Ionicons name="leaf-outline" size={22} color={colors.primary} />
        <Text style={styles.rowText}>Sobre, história e equipe</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
      <Pressable style={styles.row} onPress={() => navigation.navigate('Contact')} accessibilityRole="button">
        <Ionicons name="mail-outline" size={22} color={colors.primary} />
        <Text style={styles.rowText}>Fale com a equipe</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
    </>
  );
}

function ContaLogada({ navigation }) {
  const { user, isAdmin, canPublish, refreshUser, signOut } = useAuth();
  const { artigos, getArtigo, deleteArtigo } = useContent();
  const { savedIds } = useCommunity();
  const confirm = useConfirm();
  const [erroExclusao, setErroExclusao] = useState('');

  const isProfissional = user.role === ROLES.PROFISSIONAL;
  const salvos = savedIds()
    .map((id) => getArtigo(id))
    .filter(Boolean);
  // Admin gerencia todas as publicações; o profissional, apenas as próprias
  const publicacoes = isAdmin ? artigos : artigos.filter((artigo) => artigo.autorId === user.id);
  // GET /api/usuarios?nivel=profissional&verificacao=pendente (só para a administração)
  const { data: contasPendentes } = useApi(() => (isAdmin ? listarContasProfissionais('pendente') : Promise.resolve([])), [isAdmin], {
    recarregarAoFocar: true,
  });
  const pendentes = contasPendentes?.length ?? 0;

  // Ao abrir a tela, busca de novo os dados da conta (ex.: cadastro profissional aprovado)
  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Logout: apaga o token JWT do aparelho. Para voltar a interagir, é preciso entrar de novo.
  function sair() {
    confirm({
      title: 'Sair da conta',
      message: 'Você continua podendo ler os conteúdos. Para curtir, salvar, comentar ou publicar, entre de novo.',
      confirmLabel: 'Sair',
      onConfirm: signOut,
    });
  }

  function excluir(artigo) {
    confirm({
      title: 'Excluir artigo',
      message: `"${artigo.titulo}" será removido do app.`,
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        try {
          await deleteArtigo(artigo.id); // DELETE /api/artigos/:id
        } catch (falha) {
          setErroExclusao(falha.message);
        }
      },
    });
  }

  return (
    <Screen>
      <View style={styles.profile}>
        <Avatar name={user.name} size={64} tone={isAdmin ? 'primary' : 'mint'} />
        <View style={styles.profileText}>
          <Text style={type.h2}>{user.name}</Text>
          <Text style={type.small}>{user.email}</Text>
          {isProfissional && (
            <Text style={type.small}>
              {user.profissao} · {user.registro}
            </Text>
          )}
          <View style={styles.badges}>
            <Badge label={roleLabels[user.role]} tone={isAdmin ? 'accent' : 'mint'} icon={isAdmin ? 'shield-checkmark' : 'person'} />
            {isProfissional && <Badge label={verificacaoLabels[user.verificacao]} tone={verificacaoTone[user.verificacao]} />}
          </View>
        </View>
      </View>

      {isProfissional && user.verificacao === 'pendente' && (
        <Notice tone="warning" title="Sua conta profissional ainda está em verificação." style={styles.notice}>
          Assim que a administração confirmar seu registro, você poderá publicar.
        </Notice>
      )}
      {isProfissional && user.verificacao === 'ajustes_solicitados' && (
        <Notice tone="warning" title="A administração pediu ajustes no seu cadastro." style={styles.notice}>
          {user.observacao}
        </Notice>
      )}
      {isProfissional && user.verificacao === 'recusado' && (
        <Notice tone="danger" title="Seu cadastro profissional não foi aprovado." style={styles.notice}>
          Você pode falar com a equipe pelo contato.
        </Notice>
      )}

      {isAdmin && (
        <>
          <SectionHeader title="Administração" />
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('ProfessionalRequests')}
            accessibilityRole="button"
          >
            <Ionicons name="people-outline" size={22} color={colors.primary} />
            <Text style={styles.rowText}>Novos profissionais</Text>
            {pendentes > 0 && <Badge label={`${pendentes} pendentes`} tone="warning" />}
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </>
      )}

      {canPublish && (
        <>
          <SectionHeader title={isAdmin ? 'Publicações' : 'Minhas publicações'} />
          <Button
            title="Nova postagem"
            icon="add-circle-outline"
            variant="accent"
            onPress={() => navigation.navigate('PostForm')}
            style={styles.newPost}
          />
          {erroExclusao ? <Notice tone="danger" title={erroExclusao} /> : null}
          {publicacoes.length === 0 && <Text style={type.muted}>Você ainda não publicou nada por aqui.</Text>}
          {publicacoes.map((artigo) => (
            <ArticleCard
              key={artigo.id}
              artigo={artigo}
              onPress={() => navigation.navigate('Article', { id: artigo.id })}
              actions={
                <>
                  <Button
                    title="Editar"
                    icon="create-outline"
                    variant="outline"
                    small
                    onPress={() => navigation.navigate('PostForm', { id: artigo.id })}
                  />
                  <Button title="Excluir" icon="trash-outline" variant="danger" small onPress={() => excluir(artigo)} />
                </>
              }
            />
          ))}
        </>
      )}

      <SectionHeader title={`Conteúdos salvos (${salvos.length})`} />
      {salvos.length === 0 ? (
        <Text style={type.muted}>Você ainda não salvou conteúdos. Use o botão Salvar nos artigos.</Text>
      ) : (
        salvos.map((artigo) => (
          <Pressable
            key={artigo.id}
            style={styles.row}
            onPress={() => navigation.navigate('Article', { id: artigo.id })}
            accessibilityRole="button"
          >
            <Ionicons name="bookmark" size={20} color={colors.accent} />
            <Text style={styles.rowText} numberOfLines={2}>
              {artigo.titulo}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ))
      )}

      <LinksInstitucionais navigation={navigation} />

      <Button title="Sair" icon="log-out-outline" variant="danger" onPress={sair} style={styles.logout} />
      <Text style={[type.small, styles.version]}>Versão 1.0.0 · Entrega 3</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  guest: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  guestTitle: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  guestText: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  guestSecondary: {
    marginTop: spacing.sm,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    ...shadow,
  },
  profileText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  notice: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  rowText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  newPost: {
    marginBottom: spacing.md,
  },
  logout: {
    marginTop: spacing.xl,
  },
  version: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
