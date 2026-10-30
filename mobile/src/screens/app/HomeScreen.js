import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ArticleCard from '../../components/ArticleCard';
import Button from '../../components/Button';
import MagazineCover from '../../components/MagazineCover';
import Notice from '../../components/Notice';
import ProfessionalCard from '../../components/ProfessionalCard';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { ROLES, useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';
import { colunas } from '../../data/colunas';
import { comoFunciona } from '../../data/institucional';
import { profissionais } from '../../data/profissionais';
import { revistas } from '../../data/revistas';
import { blob, colors, fonts, radius, shadow, spacing, type } from '../../theme';

export default function HomeScreen({ navigation }) {
  const { user, canPublish } = useAuth();
  const { artigos } = useContent();

  const destaque = artigos.find((artigo) => artigo.destaque) ?? artigos[0];
  const demais = artigos.filter((artigo) => artigo.id !== destaque?.id).slice(0, 3);
  const edicaoAtual = revistas[0];
  const firstName = user.name.replace(/^Dra?\.\s+/, '').split(' ')[0];
  const emVerificacao = user.role === ROLES.PROFISSIONAL && user.verificacao !== 'aprovado';

  const abrirArtigo = (id) => navigation.navigate('Article', { id });
  const abrirConteudos = (segment) => navigation.navigate('Contents', { segment });

  return (
    <Screen>
      <Text style={type.h1}>Olá, {firstName}!</Text>
      <Text style={[type.muted, styles.greeting]}>
        Informação, acolhimento e conexão para quem cuida, educa e acompanha.
      </Text>

      {emVerificacao && (
        <Notice tone="warning" title="Conta profissional em verificação" style={styles.notice}>
          Assim que a administração confirmar seu registro, você poderá publicar.
        </Notice>
      )}

      {canPublish && (
        <Pressable style={styles.publish} onPress={() => navigation.navigate('PostForm')} accessibilityRole="button">
          <Ionicons name="add-circle" size={26} color={colors.textOnAccent} />
          <View style={styles.publishText}>
            <Text style={styles.publishTitle}>Nova postagem</Text>
            <Text style={styles.publishSubtitle}>Publique um artigo para as famílias</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.textOnAccent} />
        </Pressable>
      )}

      <View style={styles.manifesto}>
        <View style={[styles.manifestoBlob, blob(140)]} />
        <Text style={type.h2}>Cuidar dá trabalho. Encontrar boa informação não deveria dar.</Text>
        <Text style={[type.muted, styles.manifestoText]}>
          Reunimos conteúdo editorial, colunas assinadas e profissionais de confiança em um ambiente humano, claro e
          livre de julgamento.
        </Text>
      </View>

      <SectionHeader title="Conteúdos para você" actionLabel="Ver todos" onAction={() => abrirConteudos('artigos')} />
      {destaque && <ArticleCard artigo={destaque} featured onPress={() => abrirArtigo(destaque.id)} />}
      {demais.map((artigo) => (
        <ArticleCard key={artigo.id} artigo={artigo} onPress={() => abrirArtigo(artigo.id)} />
      ))}

      <SectionHeader title="Nossa revista" actionLabel="Todas as edições" onAction={() => abrirConteudos('revista')} />
      <View style={styles.magazine}>
        <MagazineCover
          revista={edicaoAtual}
          width={128}
          onPress={() => navigation.navigate('Magazine', { slug: edicaoAtual.slug })}
        />
        <View style={styles.magazineText}>
          <Text style={type.h3}>{edicaoAtual.subtitulo}</Text>
          <Text style={[type.small, styles.magazineDescription]} numberOfLines={4}>
            {edicaoAtual.descricao}
          </Text>
          <Button
            title="Conheça esta edição"
            variant="accent"
            small
            onPress={() => navigation.navigate('Magazine', { slug: edicaoAtual.slug })}
            style={styles.magazineButton}
          />
        </View>
      </View>

      <SectionHeader title="Conheça quem pode ajudar" actionLabel="Ver todos" onAction={() => navigation.navigate('Professionals')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={styles.carouselContent}>
        {profissionais.map((profissional) => (
          <ProfessionalCard
            key={profissional.slug}
            profissional={profissional}
            compact
            onPress={() => navigation.navigate('Professional', { slug: profissional.slug })}
          />
        ))}
      </ScrollView>

      <SectionHeader title="Colunas" actionLabel="Ver todas" onAction={() => abrirConteudos('colunas')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={styles.carouselContent}>
        {colunas.map((coluna) => (
          <Pressable
            key={coluna.slug}
            style={styles.column}
            onPress={() => navigation.navigate('Column', { slug: coluna.slug })}
            accessibilityRole="button"
          >
            <Text style={[type.eyebrow, styles.columnEyebrow]}>{coluna.periodicidade}</Text>
            <Text style={[type.h3, styles.columnTitle]}>{coluna.nome}</Text>
            <Text style={[type.small, styles.columnCall]} numberOfLines={3}>
              {coluna.chamada}
            </Text>
            <Text style={styles.columnAuthor}>por {coluna.colunista}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionHeader title="Como funciona" />
      {comoFunciona.map((passo, index) => (
        <View key={passo.titulo} style={styles.step}>
          <Ionicons name={passo.icon} size={24} color={colors.accent} />
          <View style={styles.stepText}>
            <Text style={styles.stepLabel}>PASSO {index + 1}</Text>
            <Text style={type.h3}>{passo.titulo}</Text>
            <Text style={type.muted}>{passo.texto}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  notice: {
    marginBottom: spacing.lg,
  },
  publish: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
  },
  publishText: {
    flex: 1,
  },
  publishTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textOnAccent,
  },
  publishSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textOnAccent,
    opacity: 0.9,
  },
  manifesto: {
    overflow: 'hidden',
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.mintSoft,
  },
  manifestoBlob: {
    position: 'absolute',
    right: -50,
    bottom: -60,
    backgroundColor: colors.mint,
  },
  manifestoText: {
    marginTop: spacing.sm,
  },
  magazine: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  magazineText: {
    flex: 1,
  },
  magazineDescription: {
    marginTop: spacing.xs,
  },
  magazineButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  carousel: {
    marginHorizontal: -spacing.md,
  },
  carouselContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  column: {
    width: 230,
    marginRight: spacing.md,
    padding: spacing.lg,
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
  columnCall: {
    marginTop: spacing.sm,
    color: colors.mintText,
  },
  columnAuthor: {
    marginTop: spacing.md,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    ...shadow,
  },
  stepText: {
    flex: 1,
  },
  stepLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.textMuted,
  },
});
