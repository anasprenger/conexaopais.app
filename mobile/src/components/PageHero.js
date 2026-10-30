import { StyleSheet, Text, View } from 'react-native';
import { blob, colors, spacing, type } from '../theme';

// Abertura das seções (como o PageHero do site): rótulo, título e descrição
export default function PageHero({ eyebrow, title, description }) {
  return (
    <View style={styles.hero}>
      <View style={[styles.decor, blob(160)]} />
      {eyebrow && <Text style={type.eyebrow}>{eyebrow}</Text>}
      <Text style={[type.h1, styles.title]}>{title}</Text>
      {description && <Text style={[type.muted, styles.description]}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  decor: {
    position: 'absolute',
    right: -50,
    top: -40,
    backgroundColor: colors.mint,
    opacity: 0.6,
  },
  title: {
    marginTop: spacing.sm,
  },
  description: {
    marginTop: spacing.sm,
  },
});
