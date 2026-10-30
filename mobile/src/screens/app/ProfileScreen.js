import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import CategoryBadge from '../../components/CategoryBadge';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import StatusBadge from '../../components/StatusBadge';
import { ROLES, roleLabels, useAuth } from '../../contexts/AuthContext';
import { useExpressions } from '../../contexts/ExpressionsContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useSuggestions } from '../../contexts/SuggestionsContext';
import { colors, fontSize, radius, shadow, spacing } from '../../theme';
import { getInitials } from '../../utils/text';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { favoriteIds } = useFavorites();
  const { getExpression } = useExpressions();
  const { suggestions } = useSuggestions();

  const favorites = favoriteIds.map(getExpression).filter(Boolean);
  const mySuggestions = suggestions.filter((suggestion) => suggestion.authorEmail === user.email);
  const isAdmin = user.role === ROLES.ADMIN;

  return (
    <Screen>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badges}>
            <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'person'}
                size={12}
                color={isAdmin ? colors.accentDark : colors.primary}
              />
              <Text style={[styles.roleText, isAdmin && styles.roleTextAdmin]}>{roleLabels[user.role]}</Text>
            </View>
            <Text style={styles.relation}>{user.relation}</Text>
          </View>
        </View>
      </View>

      <SectionHeader title={`Favoritos (${favorites.length})`} />
      {favorites.length === 0 ? (
        <Text style={styles.empty}>Toque em "Favoritar" em uma expressão para guardá-la aqui.</Text>
      ) : (
        favorites.map((expression) => (
          <Pressable
            key={expression.id}
            style={styles.row}
            onPress={() => navigation.navigate('ExpressionDetail', { id: expression.id })}
          >
            <Ionicons name="heart" size={18} color={colors.accent} />
            <Text style={styles.rowTitle}>{expression.term}</Text>
            <CategoryBadge category={expression.category} />
          </Pressable>
        ))
      )}

      <SectionHeader
        title={`Minhas sugestões (${mySuggestions.length})`}
        actionLabel="Sugerir"
        onAction={() => navigation.navigate('SuggestExpression')}
      />
      {mySuggestions.length === 0 ? (
        <Text style={styles.empty}>Você ainda não enviou sugestões.</Text>
      ) : (
        mySuggestions.map((suggestion) => (
          <View key={suggestion.id} style={styles.row}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
            <Text style={styles.rowTitle}>{suggestion.term}</Text>
            <StatusBadge status={suggestion.status} />
          </View>
        ))
      )}

      <SectionHeader title="Sobre o app" />
      <Text style={styles.about}>
        O Conexão Pais ajuda famílias a entender a linguagem das novas gerações e a transformar dúvidas em
        diálogo. Projeto alinhado ao ODS 4 (Educação de Qualidade).
      </Text>
      <Text style={styles.version}>Versão 1.0.0 · Entrega 1</Text>

      <Button title="Sair" icon="log-out-outline" variant="danger" onPress={signOut} style={styles.logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.textOnPrimary,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  email: {
    marginTop: 2,
    fontSize: fontSize.small,
    color: colors.textMuted,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  roleBadgeAdmin: {
    backgroundColor: colors.accentSoft,
  },
  roleText: {
    marginLeft: 4,
    fontSize: fontSize.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  roleTextAdmin: {
    color: colors.accentDark,
  },
  relation: {
    marginLeft: spacing.sm,
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  empty: {
    fontSize: fontSize.small,
    lineHeight: 20,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  rowTitle: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  about: {
    fontSize: fontSize.small,
    lineHeight: 20,
    color: colors.textMuted,
  },
  version: {
    marginTop: spacing.sm,
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  logout: {
    marginTop: spacing.lg,
  },
});
