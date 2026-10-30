import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

// Campo de texto com rótulo, ícone, mensagem de erro e opção de mostrar/ocultar senha
export default function TextField({ label, icon, error, secure = false, multiline = false, style, ...inputProps }) {
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.field,
          multiline && styles.multiline,
          focused && styles.focused,
          error && styles.fieldError,
        ]}
      >
        {icon && <Ionicons name={icon} size={20} color={colors.textMuted} style={styles.icon} />}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
        {secure && (
          <Pressable
            onPress={() => setHidden(!hidden)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  multiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  focused: {
    borderColor: colors.primary,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  error: {
    marginTop: 4,
    fontSize: fontSize.caption,
    color: colors.danger,
  },
});
