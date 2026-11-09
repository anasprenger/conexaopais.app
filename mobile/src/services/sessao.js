import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Guarda a sessão no aparelho (token JWT + dados do usuário) para o app continuar logado ao ser reaberto.
// - Celular: expo-secure-store, que criptografa os dados (Keystore no Android, Keychain no iOS).
// - Navegador (Expo Web): localStorage, porque o SecureStore não existe na web. Serve só para testes no computador.

const CHAVE_TOKEN = 'conexaopais.token';
const CHAVE_USUARIO = 'conexaopais.usuario';

const armazenamento =
  Platform.OS === 'web'
    ? {
        getItemAsync: async (chave) => globalThis.localStorage?.getItem(chave) ?? null,
        setItemAsync: async (chave, valor) => globalThis.localStorage?.setItem(chave, valor),
        deleteItemAsync: async (chave) => globalThis.localStorage?.removeItem(chave),
      }
    : SecureStore;

// Devolve { token, usuario } ou null se não houver sessão guardada
export async function lerSessao() {
  try {
    const [token, usuario] = await Promise.all([
      armazenamento.getItemAsync(CHAVE_TOKEN),
      armazenamento.getItemAsync(CHAVE_USUARIO),
    ]);
    return token && usuario ? { token, usuario: JSON.parse(usuario) } : null;
  } catch {
    return null; // armazenamento indisponível ou dados corrompidos: começa sem sessão
  }
}

export async function salvarSessao({ token, usuario }) {
  try {
    await armazenamento.setItemAsync(CHAVE_TOKEN, token);
    await armazenamento.setItemAsync(CHAVE_USUARIO, JSON.stringify(usuario));
  } catch {
    // sem armazenamento a sessão continua valendo, só não sobrevive ao fechar o app
  }
}

// Logout: apaga o token e os dados do aparelho
export async function apagarSessao() {
  try {
    await Promise.all([armazenamento.deleteItemAsync(CHAVE_TOKEN), armazenamento.deleteItemAsync(CHAVE_USUARIO)]);
  } catch {
    // nada guardado ou armazenamento indisponível
  }
}
