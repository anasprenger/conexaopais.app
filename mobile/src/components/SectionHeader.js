import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

// Título de seção com link de ação opcional (ex.: "Ver todas")
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  action: {
    fontSize: fontSize.small,
    fontWeight: '700',
    color: colors.primary,
  },
});
