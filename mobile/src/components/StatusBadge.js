import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { suggestionStatus } from '../data/suggestions';
import { colors, fontSize, radius } from '../theme';

const statusColors = {
  pendente: { color: colors.warning, soft: colors.warningSoft },
  aprovada: { color: colors.success, soft: colors.successSoft },
  recusada: { color: colors.danger, soft: colors.dangerSoft },
};

// Selo com o status de uma sugestão (pendente, aprovada ou recusada)
export default function StatusBadge({ status }) {
  const { label, icon } = suggestionStatus[status];
  const { color, soft } = statusColors[status];

  return (
    <View style={[styles.badge, { backgroundColor: soft }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  label: {
    marginLeft: 4,
    fontSize: fontSize.caption,
    fontWeight: '700',
  },
});
