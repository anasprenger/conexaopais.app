import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import Screen from '../../components/Screen';
import { colors, fontSize, radius, spacing } from '../../theme';

const highlights = [
  { icon: 'book', text: 'Glossário de gírias, memes, abreviações e tendências' },
  { icon: 'chatbubbles', text: 'Dicas para transformar dúvidas em conversa' },
  { icon: 'people', text: 'Conteúdo colaborativo, revisado pela nossa equipe' },
];

export default function WelcomeScreen({ navigation }) {
  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.hero}>
        <Logo size={120} showSlogan />
        <Text style={styles.tagline}>
          Entenda a linguagem das novas gerações e fortaleça o diálogo na sua família.
        </Text>
      </View>

      <View style={styles.highlights}>
        {highlights.map((item) => (
          <View key={item.icon} style={styles.highlight}>
            <View style={styles.highlightIcon}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <Text style={styles.highlightText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button title="Entrar" icon="log-in-outline" onPress={() => navigation.navigate('Login')} />
        <Button
          title="Criar conta"
          variant="outline"
          onPress={() => navigation.navigate('Register')}
          style={styles.secondButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  tagline: {
    marginTop: spacing.lg,
    fontSize: fontSize.body,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'center',
  },
  highlights: {
    marginVertical: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginRight: spacing.md,
  },
  highlightText: {
    flex: 1,
    fontSize: fontSize.small,
    lineHeight: 20,
    color: colors.text,
  },
  actions: {
    marginBottom: spacing.sm,
  },
  secondButton: {
    marginTop: spacing.sm,
  },
});
