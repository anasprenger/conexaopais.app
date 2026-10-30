import { StyleSheet, Text, View } from 'react-native';
import { blob, colors, fonts } from '../theme';
import { getInitials } from '../utils/text';

// Iniciais dentro da forma orgânica ("blob") usada no site
export default function Avatar({ name, size = 56, tone = 'mint' }) {
  const palette = {
    mint: { background: colors.mint, text: colors.mintText },
    accent: { background: colors.accentSoft, text: colors.accentDark },
    primary: { background: colors.primary, text: colors.textOnPrimary },
  }[tone];

  return (
    <View style={[styles.avatar, blob(size), { backgroundColor: palette.background }]}>
      <Text style={[styles.initials, { fontSize: size * 0.34, color: palette.text }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.display,
  },
});
