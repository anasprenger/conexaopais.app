import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../contexts/ConfirmContext';

// Visitantes podem ler tudo, mas precisam entrar para interagir (curtir, salvar, comentar...).
// Uso: const exigirLogin = useExigirLogin(); if (!exigirLogin('Entre para curtir.')) return;
export function useExigirLogin() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const navigation = useNavigation();

  return useCallback(
    (mensagem) => {
      if (user) return true;
      confirm({
        title: 'Entre para participar',
        message: mensagem,
        confirmLabel: 'Entrar',
        cancelLabel: 'Agora não',
        tone: 'primary',
        onConfirm: () => navigation.navigate('Login'),
      });
      return false;
    },
    [user, confirm, navigation]
  );
}
