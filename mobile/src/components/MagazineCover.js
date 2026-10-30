import { Pressable, StyleSheet, Text, View } from 'react-native';
import { blob, colors, fonts, radius, spacing } from '../theme';

// Capa da revista como no site: fundo verde, "blob" ocre no canto e título em Fraunces
export default function MagazineCover({ revista, width = 150, onPress }) {
  const titleSize = Math.round(width * 0.125);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.cover, { width, height: width * (4 / 3) }]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Revista edição ${revista.edicao}: ${revista.titulo}`}
    >
      <View style={[styles.decor, blob(width * 0.75)]} />
      <Text style={styles.edition}>EDIÇÃO {String(revista.edicao).padStart(2, '0')}</Text>
      <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.2 }]} numberOfLines={4}>
        {revista.titulo}
      </Text>
      <Text style={styles.date} numberOfLines={1}>
        {revista.data}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: {
    overflow: 'hidden',
    padding: spacing.md + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  decor: {
    position: 'absolute',
    right: '-22%',
    bottom: '-14%',
    backgroundColor: colors.accent,
    opacity: 0.4,
  },
  edition: {
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textOnPrimary,
    opacity: 0.75,
  },
  title: {
    marginTop: spacing.sm,
    fontFamily: fonts.display,
    color: colors.textOnPrimary,
  },
  date: {
    marginTop: 'auto',
    paddingTop: spacing.sm,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textOnPrimary,
    opacity: 0.85,
  },
});
