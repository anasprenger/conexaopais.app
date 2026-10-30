import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { getColuna } from '../../data/colunas';
import { getProfissionalPorNome } from '../../data/profissionais';
import { blob, colors, fonts, radius, shadow, spacing, type } from '../../theme';

export default function ColumnScreen({ navigation, route }) {
  const coluna = getColuna(route.params?.slug);
  const [aberto, setAberto] = useState(coluna?.posts[0]?.slug ?? null);

  useLayoutEffect(() => {
    if (coluna) navigation.setOptions({ title: coluna.nome });
  }, [navigation, coluna]);

  if (!coluna) {
    return (
      <Screen>
        <EmptyState icon="document-outline" title="Coluna não encontrada" />
      </Screen>
    );
  }

  const colunista = getProfissionalPorNome(coluna.colunista);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={[styles.decor, blob(170)]} />
        <Text style={styles.frequency}>{coluna.periodicidade.toUpperCase()}</Text>
        <Text style={styles.title}>{coluna.nome}</Text>
        <Text style={styles.call}>{coluna.chamada}</Text>
        <Pressable
          disabled={!colunista}
          onPress={() => navigation.navigate('Professional', { slug: colunista.slug })}
          style={styles.author}
          accessibilityRole={colunista ? 'link' : undefined}
        >
          <Text style={styles.authorText}>por {coluna.colunista}</Text>
          {colunista && <Ionicons name="arrow-forward" size={16} color={colors.textOnPrimary} />}
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
            onPress={() => setAberto(open ? null : post.slug)}
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
});
