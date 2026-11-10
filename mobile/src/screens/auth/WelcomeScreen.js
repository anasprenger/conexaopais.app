import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import Screen from '../../components/Screen';
import { blob, colors, fonts, spacing, type } from '../../theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={[styles.blobMint, blob(300)]} />
      <View style={styles.ring} />

      <View style={styles.topo}>
        <Logo size={40} direction="row" />
        {/* No APK, o IP do computador que roda a API pode mudar de uma rede para outra */}
        <Pressable
          onPress={() => navigation.navigate('ApiConfig')}
          style={styles.conexao}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Conexão com a API"
        >
          <Ionicons name="server-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.photoFrame}>
        <Image
          source={require('../../../assets/hero-familia.jpg')}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel="Família de três gerações rindo junta ao ar livre"
        />
      </View>

      <View>
        <Text style={type.eyebrow}>Conexão Pais</Text>
        <Text style={[type.h1, styles.title]}>Ajudando a unir famílias e gerações.</Text>
        <Text style={[type.muted, styles.description]}>
          Informação, acolhimento e conexão para quem cuida, educa e acompanha — em um só lugar.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Entrar" variant="accent" onPress={() => navigation.navigate('Login')} />
        <Button title="Criar minha conta" variant="outline" onPress={() => navigation.navigate('Register')} />
        {/* Visitantes podem ler tudo; a conta só é pedida para interagir */}
        <Pressable onPress={() => navigation.replace('Tabs')} style={styles.explorar} accessibilityRole="button">
          <Text style={styles.explorarTexto}>Explorar sem conta</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    overflow: 'hidden',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
  },
  blobMint: {
    position: 'absolute',
    left: -140,
    top: 60,
    backgroundColor: colors.mint,
    opacity: 0.55,
  },
  ring: {
    position: 'absolute',
    right: -70,
    bottom: 120,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 36,
    borderColor: colors.accent,
    opacity: 0.15,
  },
  photoFrame: {
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 40,
    backgroundColor: colors.mint,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: spacing.sm,
  },
  description: {
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  explorar: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  explorarTexto: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conexao: {
    padding: spacing.xs,
  },
});
