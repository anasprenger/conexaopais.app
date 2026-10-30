import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';

const tones = {
  success: { icon: 'checkmark-circle', color: colors.success, background: colors.successSoft },
  warning: { icon: 'time', color: colors.warning, background: colors.warningSoft },
  danger: { icon: 'alert-circle', color: colors.danger, background: colors.dangerSoft },
  info: { icon: 'information-circle', color: colors.mintText, background: colors.mint },
};

// Aviso em destaque (confirmações, situação do cadastro, orientações)
export default function Notice({ tone = 'info', title, children, style }) {
  const { icon, color, background } = tones[tone];

  return (
    <View style={[styles.notice, { backgroundColor: background }, style]} accessibilityRole="alert">
      <Ionicons name={icon} size={20} color={color} style={styles.icon} />
      <View style={styles.body}>
        {title && <Text style={[styles.title, { color }]}>{title}</Text>}
        {children && <Text style={styles.text}>{children}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
  },
  icon: {
    marginRight: spacing.sm,
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 20,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});
