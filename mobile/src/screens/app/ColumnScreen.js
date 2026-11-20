import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncState from '../../components/AsyncState';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { useCommunity } from '../../contexts/CommunityContext';
import { useApi } from '../../hooks/useApi';
import { useExigirLogin } from '../../hooks/useExigirLogin';
import { buscarColuna } from '../../services/conteudoService';
import { blob, colors, fonts, radius, shadow, spacing, type } from '../../theme';

export default function ColumnScreen({ navigation, route }) {
  // GET /api/colunas/:slug
  const { data: coluna, loading, error, reload } = useApi(() => buscarColuna(route.params?.slug), [route.params?.slug]);
  const [escolhido, setEscolhido] = useState(undefined);
  const aberto = escolhido === undefined ? coluna?.posts[0]?.slug : escolhido; // a mais recente começa aberta
  const community = useCommunity();
  const exigirLogin = useExigirLogin();
  const [erroInteracao, setErroInteracao] = useState('');

  // Como no site: colunas não têm comentários; cada publicação pode ser curtida e salva (pede login)
  async function alternar(tipo, post) {
    const aviso =
      tipo === 'curtida'
        ? 'Entre na sua conta para curtir esta publicação.'
        : 'Entre na sua conta para salvar esta publicação e ler depois.';
    if (!exigirLogin(aviso)) return;
    setErroInteracao('');
    try {
      await community.toggleColuna(tipo, coluna, post);
    } catch (falha) {
      setErroInteracao(falha.message);
    }
  }

  useLayoutEffect(() => {
    if (coluna) navigation.setOptions({ title: coluna.nome });
  }, [navigation, coluna]);

  if (!coluna) {
    return (
      <Screen>
        <AsyncState loading={loading} error={error?.status === 404 ? null : error} onRetry={reload}>
          <EmptyState icon="document-outline" title="Coluna não encontrada" />
        </AsyncState>
      </Screen>
    );
  }

  const curtido = (post) => community.isActive('curtida', post.slug);
  const salvo = (post) => community.isActive('salvo', post.slug);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={[styles.decor, blob(170)]} />
        <Text style={styles.frequency}>{coluna.periodicidade.toUpperCase()}</Text>
        <Text style={styles.title}>{coluna.nome}</Text>
        <Text style={styles.call}>{coluna.chamada}</Text>
        <Pressable
          disabled={!coluna.colunistaSlug}
          onPress={() => navigation.navigate('Professional', { slug: coluna.colunistaSlug })}
          style={styles.author}
          accessibilityRole={coluna.colunistaSlug ? 'link' : undefined}
        >
          <Text style={styles.authorText}>por {coluna.colunista}</Text>
          {coluna.colunistaSlug && <Ionicons name="arrow-forward" size={16} color={colors.textOnPrimary} />}
        </Pressable>
      </View>

      <Text style={[type.muted, styles.about]}>{coluna.sobre}</Text>

      <SectionHeader title="Publicações" />
      {coluna.posts.map((post) => {
        const open = aberto === post.slug;
        return (
          <Pressable
            key={post.slug}
            style={styles.post}
            onPress={() => setEscolhido(open ? null : post.slug)}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
          >
            <View style={styles.postHeader}>
              <View style={styles.postHeaderText}>
                <Text style={type.eyebrow}>{post.data}</Text>
                <Text style={[type.h3, styles.postTitle]}>{post.titulo}</Text>
              </View>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
            </View>
            <Text style={[type.muted, styles.postSummary]}>{post.resumo}</Text>
            {open &&
              post.texto.map((paragrafo, index) => (
                <Text key={index} style={[type.body, styles.paragraph]}>
                  {paragrafo}
                </Text>
              ))}
            {open && (
              <View style={styles.actions}>
                <Button
                  title={curtido(post) ? 'Curtido' : 'Curtir'}
                  icon={curtido(post) ? 'heart' : 'heart-outline'}
                  variant={curtido(post) ? 'accent' : 'soft'}
                  small
                  onPress={() => alternar('curtida', post)}
                />
                <Button
                  title={salvo(post) ? 'Salvo' : 'Salvar'}
                  icon={salvo(post) ? 'bookmark' : 'bookmark-outline'}
                  variant={salvo(post) ? 'accent' : 'soft'}
                  small
                  onPress={() => alternar('salvo', post)}
                />
              </View>
            )}
            {open && erroInteracao ? <Notice tone="danger" title={erroInteracao} /> : null}
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
  },
  decor: {
    position: 'absolute',
    right: -60,
    top: -60,
    backgroundColor: colors.accent,
    opacity: 0.3,
  },
  frequency: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textOnPrimary,
    opacity: 0.75,
  },
  title: {
    marginTop: spacing.sm,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textOnPrimary,
  },
  call: {
    marginTop: spacing.sm,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textOnPrimary,
    opacity: 0.85,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  authorText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textOnPrimary,
  },
  about: {
    marginTop: spacing.lg,
  },
  post: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    ...shadow,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  postHeaderText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  postTitle: {
    marginTop: spacing.xs,
  },
  postSummary: {
    marginTop: spacing.sm,
  },
  paragraph: {
    marginTop: spacing.md,
    fontSize: 16,
    lineHeight: 26,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
