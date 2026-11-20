import { useLayoutEffect } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import AsyncState from '../../components/AsyncState';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import MagazineCover from '../../components/MagazineCover';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { buscarRevista } from '../../services/conteudoService';
import { colors, fonts, radius, spacing, type } from '../../theme';

// Separa a sinopse em texto corrido e tópicos, como o site: linhas que começam com "-" ou "•" viram tópicos
// ("- A - B" na mesma linha vira dois tópicos).
export function separarSinopse(sinopse) {
  const texto = [];
  const topicos = [];
  for (const bruta of (sinopse ?? '').split(/\n/)) {
    const linha = bruta.trim();
    if (!linha) continue;
    const topico = linha.match(/^[-•–]\s*(.+)$/);
    if (topico) {
      topicos.push(
        ...topico[1]
          .split(/\s+[-–]\s+/)
          .map((item) => item.trim())
          .filter(Boolean)
      );
    } else {
      texto.push(linha);
    }
  }
  return { texto, topicos };
}

// Edição com páginas de texto (as de exemplo do site) abre no modo de leitura do app.
// Edição publicada pelo site só tem o PDF: "Começar a leitura" abre o PDF.
export function temPaginas(revista) {
  return !revista.editavel && revista.conteudo.length > 0;
}

// Sinopse da edição, como a página "Conheça esta edição" do site: capa, sinopse, destaques e os botões
// Começar a leitura e Baixar PDF. A administração edita título e sinopse das edições publicadas pelo site.
export default function MagazineScreen({ navigation, route }) {
  const { isAdmin } = useAuth();
  // GET /api/revistas/:slug
  const { data: revista, loading, error, reload } = useApi(() => buscarRevista(route.params?.slug), [route.params?.slug], {
    recarregarAoFocar: true,
  });

  useLayoutEffect(() => {
    if (revista) navigation.setOptions({ title: `Edição ${String(revista.edicao).padStart(2, '0')}` });
  }, [navigation, revista]);

  if (!revista) {
    return (
      <Screen>
        <AsyncState loading={loading} error={error?.status === 404 ? null : error} onRetry={reload}>
          <EmptyState icon="book-outline" title="Edição não encontrada" />
        </AsyncState>
      </Screen>
    );
  }

  const { texto, topicos } = separarSinopse(revista.descricao);
  const destaques = revista.destaques?.length > 0 ? revista.destaques : topicos;
  const leituraNoApp = temPaginas(revista);

  function comecarLeitura() {
    if (leituraNoApp) navigation.navigate('MagazineReader', { slug: revista.slug });
    else if (revista.pdf) Linking.openURL(revista.pdf);
  }

  return (
    <Screen>
      <View style={styles.top}>
        <MagazineCover revista={revista} width={130} />
        <View style={styles.topText}>
          <Text style={type.eyebrow}>
            Edição {String(revista.edicao).padStart(2, '0')} · {revista.data}
          </Text>
          <Text style={[type.h2, styles.title]}>{revista.titulo}</Text>
          {revista.subtitulo && revista.subtitulo !== revista.descricao ? (
            <Text style={[type.muted, styles.subtitle]}>{revista.subtitulo}</Text>
          ) : null}
        </View>
      </View>

      {isAdmin && revista.editavel && (
        <Button
          title="Editar edição"
          icon="create-outline"
          variant="outline"
          small
          onPress={() => navigation.navigate('MagazineEdit', { slug: revista.slug })}
          style={styles.edit}
        />
      )}

      <SectionHeader title="Sinopse" />
      {texto.length === 0 && destaques.length === 0 && <Text style={type.muted}>Edição digital do Conexão Pais.</Text>}
      {texto.map((paragrafo, index) => (
        <Text key={index} style={[type.body, styles.paragraph]}>
          {paragrafo}
        </Text>
      ))}

      {destaques.length > 0 && (
        <View style={styles.highlights}>
          <Text style={type.eyebrow}>Nesta edição</Text>
          {destaques.map((item) => (
            <View key={item} style={styles.highlight}>
              <View style={styles.bullet} />
              <Text style={[type.body, styles.highlightText]}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {(leituraNoApp || revista.pdf) && (
        <Button title="Começar a leitura" icon="book-outline" onPress={comecarLeitura} style={styles.read} />
      )}
      {revista.pdf && (
        <Button
          title="Baixar PDF"
          icon="download-outline"
          variant="ghost"
          onPress={() => Linking.openURL(revista.pdf)}
          style={styles.pdf}
        />
      )}
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
  title: {
    marginTop: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  edit: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  paragraph: {
    marginBottom: spacing.sm,
    fontFamily: fonts.body,
    lineHeight: 26,
  },
  highlights: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: spacing.sm,
    backgroundColor: colors.accent,
  },
  highlightText: {
    flex: 1,
  },
  read: {
    marginTop: spacing.xl,
  },
  pdf: {
    marginTop: spacing.sm,
  },
});
