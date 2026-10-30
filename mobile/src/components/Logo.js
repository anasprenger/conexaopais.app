import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize } from '../theme';

// Marca do app: balão do adulto (azul) + balão do jovem (coral)
export default function Logo({ size = 96, showName = true, showSlogan = false, direction = 'column' }) {
  const isRow = direction === 'row';

  return (
    <View style={[styles.container, isRow && styles.row]}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityLabel="Logo do Conexão Pais"
      />
      {showName && (
        <View style={isRow ? styles.textRow : styles.textColumn}>
          <Text style={[styles.name, isRow && styles.nameRow]}>
            Conexão <Text style={styles.nameAccent}>Pais</Text>
          </Text>
          {showSlogan && <Text style={styles.slogan}>ajudando a unir famílias e gerações</Text>}
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
    marginTop: 12,
  },
  textRow: {
    marginLeft: 10,
  },
  name: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  nameRow: {
    fontSize: fontSize.subtitle,
  },
  nameAccent: {
    color: colors.accent,
  },
  slogan: {
    marginTop: 4,
    fontSize: fontSize.small,
    color: colors.textMuted,
  },
});
