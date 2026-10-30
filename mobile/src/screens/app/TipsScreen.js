import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import { tips } from '../../data/tips';
import { colors, fontSize, radius, shadow, spacing } from '../../theme';

export default function TipsScreen() {
  const [openId, setOpenId] = useState(null);

  return (
    <Screen>
      <Text style={styles.intro}>
        Pequenas atitudes que fazem diferença na conversa entre gerações. Toque em uma dica para ler mais.
      </Text>

      {tips.map((tip) => {
        const open = openId === tip.id;
        return (
          <Pressable
            key={tip.id}
            style={styles.card}
            onPress={() => setOpenId(open ? null : tip.id)}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
          >
            <View style={styles.header}>
              <View style={styles.icon}>
                <Ionicons name={tip.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.tag}>{tip.tag.toUpperCase()}</Text>
                <Text style={styles.title}>{tip.title}</Text>
              </View>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
            </View>
            <Text style={styles.summary}>{tip.summary}</Text>
            {open && <Text style={styles.content}>{tip.content}</Text>}
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.md,
    fontSize: fontSize.body,
    lineHeight: 22,
    color: colors.textMuted,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  tag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.accentDark,
  },
  title: {
    marginTop: 2,
    fontSize: fontSize.body,
    fontWeight: '800',
    color: colors.text,
  },
  summary: {
    marginTop: spacing.sm,
    fontSize: fontSize.small,
    lineHeight: 20,
    color: colors.textMuted,
  },
  content: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    fontSize: fontSize.body,
    lineHeight: 24,
    color: colors.text,
  },
});
