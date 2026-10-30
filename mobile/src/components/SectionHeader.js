import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, fonts, spacing } from '../theme';

// Título de seção (Fraunces, verde) com link de ação opcional (ex.: "Ver todos")
export default function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="link">
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.primary,
  },
  action: {
    marginLeft: spacing.md,
    fontFamily: fonts.medium,
    fontSize: fontSize.small,
    color: colors.primary,
  },
});
