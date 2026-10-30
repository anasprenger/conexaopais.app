import { Alert, Platform } from 'react-native';

// Caixa de confirmação que funciona no celular (Alert) e no navegador (window.confirm)
export function confirm({ title, message, confirmLabel = 'Confirmar', onConfirm }) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
