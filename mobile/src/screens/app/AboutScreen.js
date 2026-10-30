import { Image, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import { equipe } from '../../data/equipe';
import { historia, valores } from '../../data/institucional';
import { colors, fonts, radius, spacing, type } from '../../theme';

// Sobre + Como surgiu + Equipe (três páginas do site reunidas em uma tela)
export default function AboutScreen() {
  return (
    <Screen>
      <Text style={type.eyebrow}>Sobre</Text>
      <Text style={[type.h1, styles.title]}>Um ecossistema de informação, acolhimento e conexão</Text>
      <Text style={[type.muted, styles.text]}>
        O Conexão Pais existe para aproximar famílias, responsáveis, profissionais e conhecimento — em um espaço humano,
        organizado e confiável.
      </Text>

      <View style={styles.imageFrame}>
        <Image
          source={require('../../../assets/formas-conexao.jpg')}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel="Formas orgânicas representando conexão entre pessoas"
        />
      </View>

      <View style={styles.values}>
        {valores.map((valor) => (
          <View key={valor.titulo} style={styles.value}>
            <Text style={type.h3}>{valor.titulo}</Text>
            <Text style={[type.small, styles.valueText]}>{valor.texto}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Como surgiu" />
      <Text style={type.h3}>Começou com uma pergunta: para onde a gente olha quando tem dúvida?</Text>
      <Text style={[type.muted, styles.text]}>
        O projeto nasceu voltado às mães e cresceu para abraçar todas as pessoas que cuidam — pais, avós, responsáveis e
        profissionais.
      </Text>
      <View style={styles.timeline}>
        {historia.map((etapa, index) => (
          <View key={etapa.fase} style={styles.step}>
            <View style={styles.marker}>
              <View style={styles.dot} />
              {index < historia.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.stepText}>
              <Text style={type.eyebrow}>{etapa.fase}</Text>
              <Text style={[type.body, styles.stepBody]}>{etapa.texto}</Text>
            </View>
          </View>
        ))}
      </View>

      <SectionHeader title="A equipe por trás do Conexão Pais" />
      {equipe.map((pessoa) => (
        <View key={pessoa.slug} style={styles.member}>
          <Avatar name={pessoa.nome} size={52} tone="accent" />
          <View style={styles.memberText}>
            <Text style={type.h3}>{pessoa.nome}</Text>
            <Text style={styles.role}>{pessoa.funcao}</Text>
            <Text style={[type.small, styles.memberDescription]}>{pessoa.descricao}</Text>
            <View style={styles.skills}>
              {pessoa.habilidades.map((habilidade) => (
                <Badge key={habilidade} label={habilidade} />
              ))}
            </View>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.sm,
  },
  text: {
    marginTop: spacing.sm,
  },
  imageFrame: {
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 900 / 514,
    marginTop: spacing.lg,
    borderRadius: radius.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  values: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
    marginTop: spacing.lg,
  },
  value: {
    width: '48%',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.mintSoft,
  },
  valueText: {
    marginTop: spacing.xs,
    color: colors.mintText,
  },
  timeline: {
    marginTop: spacing.lg,
  },
  step: {
    flexDirection: 'row',
  },
  marker: {
    alignItems: 'center',
    width: 20,
    marginRight: spacing.md,
  },
  dot: {
    width: 14,
    height: 14,
    marginTop: 2,
    borderRadius: 7,
    backgroundColor: colors.accent,
  },
  line: {
    flex: 1,
    width: 2,
    marginVertical: 4,
    backgroundColor: colors.border,
  },
  stepText: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  stepBody: {
    marginTop: 2,
  },
  member: {
    flexDirection: 'row',
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  memberText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  role: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.accentDark,
  },
  memberDescription: {
    marginTop: spacing.sm,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});
