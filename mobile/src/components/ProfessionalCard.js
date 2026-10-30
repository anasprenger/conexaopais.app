import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing, type } from '../theme';
import Avatar from './Avatar';

// Cartão do diretório de profissionais (iniciais no "blob", especialidade em ocre)
export default function ProfessionalCard({ profissional, onPress, compact = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Ver o perfil de ${profissional.nome}`}
    >
      <Avatar name={profissional.nome} tone={compact ? 'accent' : 'mint'} size={compact ? 52 : 60} />
      <View style={compact ? styles.bodyCompact : styles.body}>
        <Text style={type.h3}>{profissional.nome}</Text>
        <Text style={styles.specialty}>{profissional.especialidade}</Text>
        <Text style={[type.small, styles.description]} numberOfLines={compact ? 3 : undefined}>
          {profissional.descricao}
        </Text>
        <View style={styles.link}>
          <Text style={styles.linkText}>Ver perfil</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  compact: {
    flexDirection: 'column',
    width: 230,
    marginBottom: 0,
    marginRight: spacing.md,
  },
  pressed: {
    opacity: 0.88,
  },
  body: {
    flex: 1,
    marginLeft: spacing.md,
  },
  bodyCompact: {
    marginTop: spacing.md,
  },
  specialty: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.accentDark,
  },
  description: {
    marginTop: spacing.sm,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  linkText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
});
