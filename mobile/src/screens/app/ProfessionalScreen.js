import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import ArticleCard from '../../components/ArticleCard';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { useContent } from '../../contexts/ContentContext';
import { colunas } from '../../data/colunas';
import { getProfissional } from '../../data/profissionais';
import { colors, fonts, radius, spacing, type } from '../../theme';

export default function ProfessionalScreen({ navigation, route }) {
  const { artigos } = useContent();
  const profissional = getProfissional(route.params?.slug);

  useLayoutEffect(() => {
    if (profissional) navigation.setOptions({ title: 'Perfil profissional' });
  }, [navigation, profissional]);

  if (!profissional) {
    return (
      <Screen>
        <EmptyState icon="person-outline" title="Perfil não encontrado" message="Este profissional pode não estar mais com o perfil público." />
      </Screen>
    );
  }

  const conteudos = artigos.filter((artigo) => artigo.autor === profissional.nome);
  const colunasDoAutor = colunas.filter((coluna) => coluna.colunista === profissional.nome);
  const mensagem = encodeURIComponent(`Olá, ${profissional.nome}! Encontrei seu perfil no Conexão Pais.`);

  return (
    <Screen>
      <View style={styles.header}>
        <Avatar name={profissional.nome} size={88} />
        <Text style={[type.h1, styles.name]}>{profissional.nome}</Text>
        <Text style={styles.specialty}>{profissional.especialidade}</Text>
        <Text style={[type.muted, styles.description]}>{profissional.descricao}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <Text style={[type.body, styles.infoText]}>{profissional.cidade}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="videocam-outline" size={18} color={colors.primary} />
          <Text style={[type.body, styles.infoText]}>{profissional.atendimento}</Text>
        </View>
      </View>

      <Button
        title="Conversar no WhatsApp"
        icon="logo-whatsapp"
        variant="accent"
        onPress={() => Linking.openURL(`https://wa.me/${profissional.whatsapp}?text=${mensagem}`)}
      />

      {conteudos.length > 0 && <SectionHeader title="Conteúdos publicados" />}
      {conteudos.map((artigo) => (
        <ArticleCard key={artigo.id} artigo={artigo} onPress={() => navigation.navigate('Article', { id: artigo.id })} />
      ))}

      {colunasDoAutor.length > 0 && <SectionHeader title="Colunas" />}
      {colunasDoAutor.map((coluna) => (
        <Pressable
          key={coluna.slug}
          style={styles.column}
          onPress={() => navigation.navigate('Column', { slug: coluna.slug })}
          accessibilityRole="button"
        >
          <Text style={[type.eyebrow, styles.columnEyebrow]}>{coluna.periodicidade}</Text>
          <Text style={[type.h3, styles.columnTitle]}>{coluna.nome}</Text>
          <Text style={type.small}>{coluna.chamada}</Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  name: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  specialty: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.accentDark,
  },
  description: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  info: {
    gap: spacing.sm,
    marginVertical: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: spacing.sm,
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
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
});
