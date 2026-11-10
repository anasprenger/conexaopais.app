import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Armazenamento no aparelho usado pela sessão e pela configuração da API.
// - Celular: expo-secure-store, que criptografa os dados (Keystore no Android, Keychain no iOS).
// - Navegador (Expo Web): localStorage, porque o SecureStore não existe na web. Serve só para testes no computador.
const armazenamento =
  Platform.OS === 'web'
    ? {
        getItemAsync: async (chave) => globalThis.localStorage?.getItem(chave) ?? null,
        setItemAsync: async (chave, valor) => globalThis.localStorage?.setItem(chave, valor),
        deleteItemAsync: async (chave) => globalThis.localStorage?.removeItem(chave),
      }
    : SecureStore;

export default armazenamento;
