import { useLayoutEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import MagazineCover from '../../components/MagazineCover';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { getRevista } from '../../data/revistas';
import { colors, fonts, radius, shadow, spacing, type } from '../../theme';

// Leitor da revista digital: uma página por vez, como o leitor do site
export default function MagazineScreen({ navigation, route }) {
  const revista = getRevista(route.params?.slug);
  const [pagina, setPagina] = useState(0);

  useLayoutEffect(() => {
    if (revista) navigation.setOptions({ title: `Edição ${String(revista.edicao).padStart(2, '0')}` });
  }, [navigation, revista]);

  if (!revista) {
    return (
      <Screen>
        <EmptyState icon="book-outline" title="Edição não encontrada" />
      </Screen>
    );
  }

  const atual = revista.conteudo[pagina];
  const total = revista.conteudo.length;

  return (
    <Screen>
      <View style={styles.top}>
        <MagazineCover revista={revista} width={120} />
        <View style={styles.topText}>
          <Text style={type.eyebrow}>{revista.categoria}</Text>
          <Text style={[type.h3, styles.subtitle]}>{revista.subtitulo}</Text>
          <Text style={[type.small, styles.meta]}>
            {revista.data} · {revista.paginas} páginas
          </Text>
        </View>
      </View>

      <Text style={[type.muted, styles.description]}>{revista.descricao}</Text>

      <SectionHeader title="Leitura" />
      <View style={styles.page}>
        <Text style={type.eyebrow}>
          Página {atual.numero} de {total} · {atual.secao}
        </Text>
        <Text style={[type.h2, styles.pageTitle]}>{atual.titulo}</Text>
        {atual.texto.map((paragrafo, index) => (
          <Text key={index} style={[type.body, styles.paragraph]}>
            {paragrafo}
          </Text>
        ))}
      </View>

      <View style={styles.dots}>
        {revista.conteudo.map((item, index) => (
          <View key={item.numero} style={[styles.dot, index === pagina && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.nav}>
        <Button
          title="Anterior"
          icon="chevron-back"
          variant="outline"
          small
          disabled={pagina === 0}
          onPress={() => setPagina(pagina - 1)}
          style={styles.navButton}
        />
        <Button
          title="Próxima"
          variant="primary"
          small
          disabled={pagina === total - 1}
          onPress={() => setPagina(pagina + 1)}
          style={styles.navButton}
        />
      </View>

      <Button
        title="Abrir o PDF no site"
        icon="document-text-outline"
        variant="ghost"
        onPress={() => Linking.openURL(revista.pdf)}
        style={styles.pdf}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  topText: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  meta: {
    marginTop: spacing.sm,
  },
  description: {
    marginTop: spacing.lg,
  },
  page: {
    minHeight: 260,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...shadow,
  },
  pageTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  paragraph: {
    marginTop: spacing.sm,
    fontFamily: fonts.body,
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.accent,
  },
  nav: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  navButton: {
    flex: 1,
  },
  pdf: {
    marginTop: spacing.sm,
  },
});
