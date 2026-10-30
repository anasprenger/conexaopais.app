import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ArticleCard from '../../components/ArticleCard';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import TextField from '../../components/TextField';
import { ROLES, canEditArticle, useAuth } from '../../contexts/AuthContext';
import { useCommunity } from '../../contexts/CommunityContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useContent } from '../../contexts/ContentContext';
import { getProfissionalPorNome } from '../../data/profissionais';
import { colors, fonts, radius, spacing, type } from '../../theme';

export default function ArticleScreen({ navigation, route }) {
  const { user } = useAuth();
  const { artigos, getArtigo, deleteArtigo } = useContent();
  const community = useCommunity();
  const confirm = useConfirm();
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState('');

  const artigo = getArtigo(route.params?.id);

  if (!artigo) {
    return (
      <Screen>
        <EmptyState icon="document-outline" title="Artigo não encontrado" message="Este conteúdo pode ter sido movido ou despublicado." />
      </Screen>
    );
  }

  const autor = getProfissionalPorNome(artigo.autor);
  const curtido = community.isActive(user, 'curtida', artigo.id);
  const salvo = community.isActive(user, 'salvo', artigo.id);
  const comentarios = community.comentariosDo(artigo.id);
  const relacionados = artigos.filter((item) => item.id !== artigo.id).slice(0, 2);
  const podeEditar = canEditArticle(user, artigo);

  function publicarComentario() {
    if (comentario.trim().length < 3) {
      setErro('Escreva seu comentário antes de publicar.');
      return;
    }
    community.addComentario(user, artigo.id, comentario);
    setComentario('');
    setErro('');
  }

  function excluirArtigo() {
    confirm({
      title: 'Excluir artigo',
      message: `"${artigo.titulo}" será removido do app.`,
      confirmLabel: 'Excluir',
      onConfirm: () => {
        deleteArtigo(artigo.id);
        navigation.goBack();
      },
    });
  }

  function excluirComentario(item) {
    confirm({
      title: 'Excluir comentário',
      message: 'Este comentário será removido da conversa.',
      confirmLabel: 'Excluir',
      onConfirm: () => community.deleteComentario(item.id),
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
        disabled={!autor}
        onPress={() => navigation.navigate('Professional', { slug: autor.slug })}
        accessibilityRole={autor ? 'link' : undefined}
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
          title={`${curtido ? 'Curtido' : 'Curtir'} · ${community.count('curtida', artigo.id)}`}
          icon={curtido ? 'heart' : 'heart-outline'}
          variant={curtido ? 'accent' : 'soft'}
          small
          onPress={() => community.toggle(user, 'curtida', artigo.id)}
        />
        <Button
          title={salvo ? 'Salvo' : 'Salvar'}
          icon={salvo ? 'bookmark' : 'bookmark-outline'}
          variant={salvo ? 'accent' : 'soft'}
          small
          onPress={() => community.toggle(user, 'salvo', artigo.id)}
        />
      </View>

      {artigo.conteudo.map((paragrafo, index) => (
        <Text key={index} style={[type.body, styles.paragraph]}>
          {paragrafo}
        </Text>
      ))}

      {podeEditar && (
        <View style={styles.manage}>
          <Text style={type.small}>
            {user.role === ROLES.ADMIN ? 'Você administra este conteúdo.' : 'Você é o autor deste artigo.'}
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
        </View>
      )}

      <SectionHeader title={`Comentários (${comentarios.length})`} />
      {comentarios.length === 0 && <Text style={type.muted}>Ninguém comentou ainda. Comece a conversa.</Text>}
      {comentarios.map((item) => {
        const podeExcluir = item.userId === user.id || user.role === ROLES.ADMIN;
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
              <Pressable onPress={() => excluirComentario(item)} hitSlop={8} accessibilityLabel="Excluir comentário">
                <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        );
      })}

      <TextField
        placeholder="Escreva seu comentário com respeito e cuidado."
        multiline
        value={comentario}
        onChangeText={setComentario}
        error={erro}
        style={styles.commentField}
      />
      <Button title="Publicar comentário" icon="chatbubble-outline" onPress={publicarComentario} />

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
});
