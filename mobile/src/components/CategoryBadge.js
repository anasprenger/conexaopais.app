import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { getCategory } from '../data/categories';
import { categoryStyles, fontSize, radius } from '../theme';

// Selo colorido com a categoria de uma expressão
export default function CategoryBadge({ category }) {
  const style = categoryStyles[category];
  const { label } = getCategory(category);

  return (
    <View style={[styles.badge, { backgroundColor: style.soft }]}>
      <Ionicons name={style.icon} size={12} color={style.color} />
      <Text style={[styles.label, { color: style.color }]}>{label}</Text>
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
  label: {
    marginLeft: 4,
    fontSize: fontSize.caption,
    fontWeight: '700',
  },
});
