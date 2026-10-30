import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

const tones = {
  primary: { color: colors.primary, background: colors.primarySoft },
  accent: { color: colors.accentDark, background: colors.accentSoft },
  mint: { color: colors.mintText, background: colors.mint },
  success: { color: colors.success, background: colors.successSoft },
  warning: { color: colors.warning, background: colors.warningSoft },
  danger: { color: colors.danger, background: colors.dangerSoft },
};

// Selo pequeno (nível do usuário, situação do cadastro, etiquetas)
export default function Badge({ label, tone = 'mint', icon }) {
  const { color, background } = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      {icon && <Ionicons name={icon} size={12} color={color} style={styles.icon} />}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
});
