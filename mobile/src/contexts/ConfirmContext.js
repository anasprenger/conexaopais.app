import { createContext, useContext, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import { colors, fontSize, fonts, radius, spacing } from '../theme';

const ConfirmContext = createContext(null);

// Caixa de confirmação própria do app (mesma aparência no Android, iOS e navegador).
// Uso: const confirm = useConfirm(); confirm({ title, message, confirmLabel, onConfirm })
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  function close() {
    setRequest(null);
  }

  function handleConfirm() {
    const { onConfirm } = request;
    close();
    onConfirm();
  }

  return (
    <ConfirmContext.Provider value={setRequest}>
      {children}
      <Modal visible={!!request} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Fechar">
          <Pressable style={styles.dialog} accessibilityRole="alert">
            <Text style={styles.title}>{request?.title}</Text>
            <Text style={styles.message}>{request?.message}</Text>
            <View style={styles.actions}>
              <Button title="Cancelar" variant="ghost" small onPress={close} />
              <Button title={request?.confirmLabel ?? 'Confirmar'} variant="danger" small onPress={handleConfirm} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(27, 40, 30, 0.5)',
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.subtitle,
    color: colors.text,
  },
  message: {
    marginTop: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSize.body,
    lineHeight: 22,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
