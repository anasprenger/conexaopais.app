import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ArticleCard from '../../components/ArticleCard';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { ROLES, roleLabels, useAuth, verificacaoLabels } from '../../contexts/AuthContext';
import { useCommunity } from '../../contexts/CommunityContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useContent } from '../../contexts/ContentContext';
import { colors, fonts, radius, shadow, spacing, type } from '../../theme';

const verificacaoTone = { pendente: 'warning', aprovado: 'success', ajustes_solicitados: 'warning', recusado: 'danger' };

export default function AccountScreen({ navigation }) {
  const { user, users, isAdmin, canPublish, signOut } = useAuth();
  const { artigos, getArtigo, deleteArtigo } = useContent();
  const { savedIds } = useCommunity();
  const confirm = useConfirm();

  const isProfissional = user.role === ROLES.PROFISSIONAL;
  const salvos = savedIds(user).map(getArtigo).filter(Boolean);
  // Admin gerencia todas as publicações; o profissional, apenas as próprias
  const publicacoes = isAdmin ? artigos : artigos.filter((artigo) => artigo.autorId === user.id);
  const pendentes = users.filter((item) => item.role === ROLES.PROFISSIONAL && item.verificacao === 'pendente').length;

  function excluir(artigo) {
    confirm({
      title: 'Excluir artigo',
      message: `"${artigo.titulo}" será removido do app.`,
      confirmLabel: 'Excluir',
      onConfirm: () => deleteArtigo(artigo.id),
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

      <Button title="Sair" icon="log-out-outline" variant="danger" onPress={signOut} style={styles.logout} />
      <Text style={[type.small, styles.version]}>Versão 1.0.0 · Entrega 1</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
