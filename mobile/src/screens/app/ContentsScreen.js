import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ArticleCard from '../../components/ArticleCard';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import MagazineCover from '../../components/MagazineCover';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import SegmentedControl from '../../components/SegmentedControl';
import TextField from '../../components/TextField';
import { useContent } from '../../contexts/ContentContext';
import { colunas } from '../../data/colunas';
import { revistas } from '../../data/revistas';
import { colors, fonts, radius, spacing, type } from '../../theme';
import { normalize } from '../../utils/text';

const segments = [
  { id: 'artigos', label: 'Artigos' },
  { id: 'colunas', label: 'Colunas' },
  { id: 'revista', label: 'Revista' },
];

const intros = {
  artigos: 'Textos curtos e práticos, escritos e revisados por profissionais que convivem com famílias todos os dias.',
  colunas: 'Vozes que acompanham famílias de perto: espaços fixos de autoria, com periodicidade própria.',
  revista: 'Cada edição reúne reportagens, entrevistas e ensaios sobre a vida em família, para ler com calma.',
};

export default function ContentsScreen({ navigation, route }) {
  const { artigos, categorias } = useContent();
  const [segment, setSegment] = useState(route.params?.segment ?? 'artigos');
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');

  // Permite abrir direto em uma seção (ex.: "Todas as edições" na tela Início)
  useEffect(() => {
    if (route.params?.segment) setSegment(route.params.segment);
  }, [route.params]);

  const termo = normalize(busca);
  const resultados = artigos.filter((artigo) => {
    const combinaCategoria = categoria === 'Todas' || artigo.categoria === categoria;
    const combinaBusca =
      !termo ||
      [artigo.titulo, artigo.resumo, artigo.autor, ...(artigo.tags ?? [])].some((campo) => normalize(campo).includes(termo));
    return combinaCategoria && combinaBusca;
  });

  const [atual, ...anteriores] = revistas;

  return (
    <Screen>
      <SegmentedControl options={segments} value={segment} onChange={setSegment} />
      <Text style={[type.muted, styles.intro]}>{intros[segment]}</Text>

      {segment === 'artigos' && (
        <>
          <TextField icon="search" placeholder="Buscar artigos..." value={busca} onChangeText={setBusca} autoCapitalize="none" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={styles.chipsContent}>
            {['Todas', ...categorias].map((item) => (
              <Chip key={item} label={item} selected={categoria === item} onPress={() => setCategoria(item)} />
            ))}
          </ScrollView>
          {resultados.length === 0 ? (
            <EmptyState title="Nenhum artigo encontrado para esta busca." message="Tente outra palavra ou outra categoria." />
          ) : (
            resultados.map((artigo) => (
              <ArticleCard key={artigo.id} artigo={artigo} onPress={() => navigation.navigate('Article', { id: artigo.id })} />
            ))
          )}
        </>
      )}

      {segment === 'colunas' &&
        colunas.map((coluna) => (
          <Pressable
            key={coluna.slug}
            style={styles.column}
            onPress={() => navigation.navigate('Column', { slug: coluna.slug })}
            accessibilityRole="button"
          >
            <Text style={[type.eyebrow, styles.columnEyebrow]}>{coluna.periodicidade}</Text>
            <Text style={[type.h2, styles.columnTitle]}>{coluna.nome}</Text>
            <Text style={[type.muted, styles.columnText]}>{coluna.chamada}</Text>
            <Text style={styles.columnAuthor}>por {coluna.colunista}</Text>
            <Text style={[type.small, styles.columnCount]}>
              {coluna.posts.length} {coluna.posts.length === 1 ? 'publicação' : 'publicações'} · abrir coluna
            </Text>
          </Pressable>
        ))}

      {segment === 'revista' && (
        <>
          <View style={styles.current}>
            <MagazineCover revista={atual} width={190} onPress={() => navigation.navigate('Magazine', { slug: atual.slug })} />
            <Text style={[type.eyebrow, styles.currentEyebrow]}>Edição atual</Text>
            <Text style={[type.h2, styles.currentTitle]}>{atual.subtitulo}</Text>
            <Text style={[type.muted, styles.currentText]}>{atual.descricao}</Text>
            {atual.destaques.map((item) => (
              <View key={item} style={styles.highlight}>
                <View style={styles.dot} />
                <Text style={[type.muted, styles.highlightText]}>{item}</Text>
              </View>
            ))}
            <Button
              title="Conheça esta edição"
              variant="accent"
              icon="book-outline"
              onPress={() => navigation.navigate('Magazine', { slug: atual.slug })}
              style={styles.currentButton}
            />
          </View>

          <SectionHeader title="Edições anteriores" />
          {anteriores.map((revista) => (
            <Pressable
              key={revista.slug}
              style={styles.edition}
              onPress={() => navigation.navigate('Magazine', { slug: revista.slug })}
              accessibilityRole="button"
            >
              <Text style={type.eyebrow}>
                Edição {String(revista.edicao).padStart(2, '0')} · {revista.data}
              </Text>
              <Text style={[type.h2, styles.columnTitle]}>{revista.titulo}</Text>
              <Text style={[type.muted, styles.columnText]}>{revista.descricao}</Text>
              <View style={styles.readLink}>
                <Text style={styles.columnAuthor}>Ler edição</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.md,
  },
  chips: {
    marginHorizontal: -spacing.md,
    marginBottom: spacing.sm,
  },
  chipsContent: {
    paddingHorizontal: spacing.md,
  },
  column: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.mintSoft,
  },
  columnEyebrow: {
    color: colors.mintText,
    opacity: 0.75,
  },
  columnTitle: {
    marginTop: spacing.sm,
  },
  columnText: {
    marginTop: spacing.sm,
  },
  columnAuthor: {
    marginTop: spacing.md,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  columnCount: {
    marginTop: spacing.xs,
  },
  current: {
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  currentEyebrow: {
    marginTop: spacing.lg,
  },
  currentTitle: {
    marginTop: spacing.sm,
  },
  currentText: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    marginTop: 9,
    marginRight: spacing.sm,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  highlightText: {
    flex: 1,
  },
  currentButton: {
    marginTop: spacing.lg,
  },
  edition: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.mintSoft,
  },
  readLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
