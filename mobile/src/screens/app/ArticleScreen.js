import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ArticleCard from '../../components/ArticleCard';
import AsyncState from '../../components/AsyncState';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ConviteLogin from '../../components/ConviteLogin';
import EmptyState from '../../components/EmptyState';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import TextField from '../../components/TextField';
import { ROLES, canEditArticle, useAuth } from '../../contexts/AuthContext';
import { useCommunity } from '../../contexts/CommunityContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useContent } from '../../contexts/ContentContext';
import { useApi } from '../../hooks/useApi';
import { useExigirLogin } from '../../hooks/useExigirLogin';
import { buscarArtigo, comentar, excluirComentario, listarComentarios } from '../../services/artigosService';
import { colors, fonts, radius, spacing, type } from '../../theme';

export default function ArticleScreen({ navigation, route }) {
  const { user } = useAuth();
  const { artigos, getArtigo, deleteArtigo, patchArtigo } = useContent();
  const community = useCommunity();
  const confirm = useConfirm();
  const exigirLogin = useExigirLogin();
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState('');
  const [erroExclusao, setErroExclusao] = useState('');
  const [erroInteracao, setErroInteracao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const id = route.params?.id;

  // GET /api/artigos/:id — busca de novo ao voltar da edição
  const { data: artigo, loading, error, reload } = useApi(() => buscarArtigo(id), [id], { recarregarAoFocar: true });
  // GET /api/artigos/:id/comentarios
  const comentariosApi = useApi(() => listarComentarios(id), [id]);

  if (!artigo) {
    return (
      <Screen>
        <AsyncState loading={loading} error={error?.status === 404 ? null : error} onRetry={reload}>
          <EmptyState icon="document-outline" title="Artigo não encontrado" message="Este conteúdo pode ter sido movido ou despublicado." />
        </AsyncState>
      </Screen>
    );
  }

  const curtido = community.isActive('curtida', artigo.id);
  const salvo = community.isActive('salvo', artigo.id);
  const curtidas = getArtigo(artigo.id)?.curtidas ?? artigo.curtidas; // total atualizado depois de curtir
  const comentarios = comentariosApi.data ?? [];
  const relacionados = artigos.filter((item) => item.id !== artigo.id).slice(0, 2);
  const podeEditar = canEditArticle(user, artigo);

  async function alternar(tipo) {
    // visitante lê o artigo, mas precisa entrar para curtir ou salvar
    const aviso =
      tipo === 'curtida'
        ? 'Entre na sua conta para curtir este artigo.'
        : 'Entre na sua conta para salvar este artigo e ler depois.';
    if (!exigirLogin(aviso)) return;
    setErroInteracao('');
    try {
      await community.toggle(tipo, artigo.id);
    } catch (falha) {
      setErroInteracao(falha.message);
    }
  }

  // POST /api/artigos/:id/comentarios
  async function publicarComentario() {
    if (comentario.trim().length < 3) {
      setErro('Escreva seu comentário antes de publicar.');
      return;
    }
    setEnviando(true);
    try {
      await comentar(artigo.id, user.id, comentario.trim());
      setComentario('');
      setErro('');
      await comentariosApi.reload();
      patchArtigo(artigo.id, { comentarios: comentarios.length + 1 });
    } catch (falha) {
      setErro(falha.campos.texto ?? falha.message);
    } finally {
      setEnviando(false);
    }
  }

  function excluirArtigo() {
    confirm({
      title: 'Excluir artigo',
      message: `"${artigo.titulo}" será removido do app.`,
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        try {
          await deleteArtigo(artigo.id); // DELETE /api/artigos/:id
          navigation.goBack();
        } catch (falha) {
          setErroExclusao(falha.message);
        }
      },
    });
  }

  function confirmarExclusaoComentario(item) {
    confirm({
      title: 'Excluir comentário',
      message: 'Este comentário será removido da conversa.',
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        try {
          await excluirComentario(item.id); // DELETE /api/comentarios/:id
          await comentariosApi.reload();
          patchArtigo(artigo.id, { comentarios: Math.max(0, comentarios.length - 1) });
        } catch (falha) {
          setErro(falha.message);
        }
      },
    });
  }

  return (
    <Screen>
      <Text style={type.eyebrow}>
        {artigo.categoria} · {artigo.leitura} de leitura
      </Text>
      <Text style={[type.h1, styles.title]}>{artigo.titulo}</Text>
      <Text style={[type.muted, styles.summary]}>{artigo.resumo}</Text>

      <Pressable
        style={styles.author}
        disabled={!artigo.autorSlug}
        onPress={() => navigation.navigate('Professional', { slug: artigo.autorSlug })}
        accessibilityRole={artigo.autorSlug ? 'link' : undefined}
      >
        <Avatar name={artigo.autor} size={40} />
        <View style={styles.authorText}>
          <Text style={styles.authorName}>{artigo.autor}</Text>
          <Text style={type.small}>{artigo.data}</Text>
        </View>
      </Pressable>

      {artigo.tags?.length > 0 && (
        <View style={styles.tags}>
          {artigo.tags.map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title={`${curtido ? 'Curtido' : 'Curtir'} · ${curtidas}`}
          icon={curtido ? 'heart' : 'heart-outline'}
          variant={curtido ? 'accent' : 'soft'}
          small
          onPress={() => alternar('curtida')}
        />
        <Button
          title={salvo ? 'Salvo' : 'Salvar'}
          icon={salvo ? 'bookmark' : 'bookmark-outline'}
          variant={salvo ? 'accent' : 'soft'}
          small
          onPress={() => alternar('salvo')}
        />
      </View>
      {erroInteracao ? <Notice tone="danger" title={erroInteracao} /> : null}

      {artigo.conteudo.map((paragrafo, index) => (
        <Text key={index} style={[type.body, styles.paragraph]}>
          {paragrafo}
        </Text>
      ))}

      {podeEditar && (
        <View style={styles.manage}>
          <Text style={type.small}>
            {user?.role === ROLES.ADMIN ? 'Você administra este conteúdo.' : 'Você é o autor deste artigo.'}
          </Text>
          <View style={styles.manageButtons}>
            <Button
              title="Editar"
              icon="create-outline"
              variant="outline"
              small
              onPress={() => navigation.navigate('PostForm', { id: artigo.id })}
            />
            <Button title="Excluir" icon="trash-outline" variant="danger" small onPress={excluirArtigo} />
          </View>
          {erroExclusao ? <Notice tone="danger" title={erroExclusao} style={styles.notice} /> : null}
        </View>
      )}

      <SectionHeader title={`Comentários (${comentarios.length})`} />
      <AsyncState
        loading={comentariosApi.loading && !comentariosApi.data}
        error={comentariosApi.error}
        onRetry={comentariosApi.reload}
        compact
      >
        {comentarios.length === 0 && <Text style={type.muted}>Ninguém comentou ainda. Comece a conversa.</Text>}
      </AsyncState>
      {comentarios.map((item) => {
        // Entrega 3: a API também vai conferir quem pode excluir (autor do comentário ou admin)
        const podeExcluir = Boolean(user) && (item.usuarioId === user.id || user.role === ROLES.ADMIN);
        return (
          <View key={item.id} style={styles.comment}>
            <Avatar name={item.autor} size={36} tone="accent" />
            <View style={styles.commentBody}>
              <Text style={styles.commentAuthor}>
                {item.autor} <Text style={type.small}>· {item.data}</Text>
              </Text>
              <Text style={[type.body, styles.commentText]}>{item.texto}</Text>
            </View>
            {podeExcluir && (
              <Pressable onPress={() => confirmarExclusaoComentario(item)} hitSlop={8} accessibilityLabel="Excluir comentário">
                <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        );
      })}

      {user ? (
        <>
          <TextField
            placeholder="Escreva seu comentário com respeito e cuidado."
            multiline
            value={comentario}
            onChangeText={setComentario}
            error={erro}
            style={styles.commentField}
          />
          <Button title="Publicar comentário" icon="chatbubble-outline" loading={enviando} onPress={publicarComentario} />
        </>
      ) : (
        <ConviteLogin
          title="Quer participar da conversa?"
          message="Entre na sua conta para comentar e conversar com outras famílias e com quem escreveu o texto."
          style={styles.convite}
        />
      )}

      <SectionHeader title="Conteúdos relacionados" />
      {relacionados.map((item) => (
        <ArticleCard key={item.id} artigo={item} onPress={() => navigation.push('Article', { id: item.id })} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.sm,
  },
  summary: {
    marginTop: spacing.sm,
    fontSize: 17,
    lineHeight: 25,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  authorText: {
    marginLeft: spacing.sm,
  },
  authorName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.primary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paragraph: {
    marginBottom: spacing.md,
    fontSize: 17,
    lineHeight: 28,
  },
  manage: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  manageButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  commentText: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 22,
  },
  commentField: {
    marginTop: spacing.md,
  },
  notice: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
  convite: {
    marginTop: spacing.md,
  },
});
