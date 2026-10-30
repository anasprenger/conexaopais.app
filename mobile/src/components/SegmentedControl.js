import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow, spacing } from '../theme';

// Alternador de seções (ex.: Artigos | Colunas | Revista)
export default function SegmentedControl({ options, value, onChange }) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.item, active && styles.active]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.mint,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
  },
  active: {
    backgroundColor: colors.card,
    ...shadow,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.mintText,
  },
  labelActive: {
    color: colors.primary,
  },
});
