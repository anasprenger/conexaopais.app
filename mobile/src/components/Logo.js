import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, fonts } from '../theme';

// Marca do Conexão Pais: a árvore do site + nome em Fraunces.
// light = versão clara, para usar sobre o verde.
export default function Logo({ size = 96, showName = true, showSlogan = false, direction = 'column', light = false }) {
  const isRow = direction === 'row';
  const source = light ? require('../../assets/logo-light.png') : require('../../assets/logo.png');

  return (
    <View style={[styles.container, isRow && styles.row]}>
      <Image source={source} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel="Logo do Conexão Pais" />
      {showName && (
        <View style={isRow ? styles.textRow : styles.textColumn}>
          <Text style={[styles.name, isRow && styles.nameRow, light && styles.light]}>Conexão Pais</Text>
          {showSlogan && (
            <Text style={[styles.slogan, light && styles.sloganLight]}>Ajudando a unir famílias e gerações.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  textColumn: {
    alignItems: 'center',
    marginTop: 10,
  },
  textRow: {
    marginLeft: 8,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSize.hero,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  nameRow: {
    fontSize: fontSize.subtitle,
  },
  light: {
    color: colors.textOnPrimary,
  },
  slogan: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: fontSize.small,
    color: colors.textMuted,
  },
  sloganLight: {
    color: colors.textOnPrimary,
    opacity: 0.8,
  },
});
