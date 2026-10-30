import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import PageHero from '../../components/PageHero';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import TextField from '../../components/TextField';
import { useAuth } from '../../contexts/AuthContext';
import { useCommunity } from '../../contexts/CommunityContext';
import { useContent } from '../../contexts/ContentContext';
import { recursosComunidade, regrasComunidade } from '../../data/institucional';
import { colors, fonts, radius, shadow, spacing, type } from '../../theme';
import { plural } from '../../utils/text';

export default function CommunityScreen({ navigation }) {
  const { user } = useAuth();
  const { artigos, getArtigo } = useContent();
  const community = useCommunity();
  const [aberto, setAberto] = useState(null);
  const [pergunta, setPergunta] = useState('');
  const [erro, setErro] = useState('');
  const [enviada, setEnviada] = useState(false);

  const destaques = [
    { titulo: 'Artigos com mais curtidas', tipo: 'curtida', unidade: ['curtida', 'curtidas'], vazio: 'Ainda sem curtidas.' },
    { titulo: 'Artigos mais salvos', tipo: 'salvo', unidade: ['vez salvo', 'vezes salvo'], vazio: 'Nada salvo ainda.' },
  ];

  function enviarPergunta() {
    if (pergunta.trim().length < 10) {
      setErro('Escreva um pouco mais para a equipe entender sua dúvida.');
      return;
    }
    setPergunta('');
    setErro('');
    setEnviada(true);
  }

  return (
    <Screen>
      <PageHero
        eyebrow="Comunidade"
        title="Ninguém precisa cuidar sozinho"
        description="Responsáveis e profissionais em conversas calmas, mediadas e sem julgamento."
      />

      {recursosComunidade.map((recurso) => {
        const open = aberto === recurso.titulo;
        return (
          <Pressable
            key={recurso.titulo}
            style={styles.resource}
            onPress={() => setAberto(open ? null : recurso.titulo)}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
          >
            <View style={styles.resourceHeader}>
              <Ionicons name={recurso.icon} size={22} color={colors.accent} />
              <Text style={[type.h3, styles.resourceTitle]}>{recurso.titulo}</Text>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
            </View>
            <Text style={[type.muted, styles.resourceText]}>{recurso.texto}</Text>
            {open && <Text style={[type.muted, styles.resourceDetail]}>{recurso.detalhe}</Text>}
          </Pressable>
        );
      })}

      <SectionHeader title="Conversas em andamento" />
      <Text style={[type.muted, styles.hint]}>Curta e salve para acompanhar. Toque no título para abrir o conteúdo.</Text>
      {artigos.map((artigo) => {
        const curtido = community.isActive(user, 'curtida', artigo.id);
        const salvo = community.isActive(user, 'salvo', artigo.id);
        return (
          <View key={artigo.id} style={styles.conversation}>
            <Text style={type.eyebrow}>
              {artigo.categoria} · {artigo.leitura} de leitura
            </Text>
            <Pressable onPress={() => navigation.navigate('Article', { id: artigo.id })} accessibilityRole="link">
              <Text style={[type.h3, styles.conversationTitle]}>{artigo.titulo}</Text>
            </Pressable>
            <Text style={type.small}>
              {plural(community.comentariosDo(artigo.id).length, 'comentário', 'comentários')} ·{' '}
              {plural(community.count('curtida', artigo.id), 'curtida', 'curtidas')}
            </Text>
            <View style={styles.conversationActions}>
              <Button
                title={curtido ? 'Curtido' : 'Curtir'}
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
          </View>
        );
      })}

      <SectionHeader title="Destaques da comunidade" />
      {destaques.map((destaque) => {
        const lista = community.ranking(destaque.tipo).filter((item) => getArtigo(item.artigoId));
        return (
          <View key={destaque.tipo} style={styles.ranking}>
            <Text style={type.h3}>{destaque.titulo}</Text>
            {lista.length === 0 && <Text style={[type.muted, styles.rankingEmpty]}>{destaque.vazio}</Text>}
            {lista.map((item, index) => (
              <Pressable
                key={item.artigoId}
                style={styles.rankingRow}
                onPress={() => navigation.navigate('Article', { id: item.artigoId })}
              >
                <Text style={styles.rankingPosition}>{index + 1}</Text>
                <View style={styles.rankingText}>
                  <Text style={styles.rankingTitle}>{getArtigo(item.artigoId).titulo}</Text>
                  <Text style={type.small}>{plural(item.total, ...destaque.unidade)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        );
      })}

      <View style={styles.ask}>
        <Text style={type.h2}>Pergunte à equipe</Text>
        <Text style={[type.muted, styles.askText]}>Sua dúvida pode virar resposta na coluna Consultório aberto.</Text>
        {enviada && (
          <Notice tone="success" title="Pergunta enviada para a moderação.">
            Em breve alguém responde.
          </Notice>
        )}
        <TextField
          placeholder="Escreva sua pergunta..."
          multiline
          value={pergunta}
          onChangeText={(value) => {
            setPergunta(value);
            setEnviada(false);
          }}
          error={erro}
        />
        <Button title="Enviar pergunta" variant="accent" small onPress={enviarPergunta} style={styles.askButton} />
      </View>

      <SectionHeader title="Regras de convivência" />
      {regrasComunidade.map((regra) => (
        <View key={regra} style={styles.rule}>
          <View style={styles.dot} />
          <Text style={[type.muted, styles.ruleText]}>{regra}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  resource: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceTitle: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  resourceText: {
    marginTop: spacing.sm,
  },
  resourceDetail: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hint: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  conversation: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    ...shadow,
  },
  conversationTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  conversationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  ranking: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  rankingEmpty: {
    marginTop: spacing.sm,
  },
  rankingRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  rankingPosition: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.accent,
  },
  rankingText: {
    flex: 1,
  },
  rankingTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.primary,
  },
  ask: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.mintSoft,
  },
  askText: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  askButton: {
    alignSelf: 'flex-start',
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    marginTop: 9,
    marginRight: spacing.sm,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  ruleText: {
    flex: 1,
  },
});
