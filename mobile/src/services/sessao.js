import armazenamento from './armazenamento';

// Guarda a sessão no aparelho (token JWT + dados do usuário) para o app continuar logado ao ser reaberto.
// No celular os dados ficam criptografados (expo-secure-store); veja services/armazenamento.js.

const CHAVE_TOKEN = 'conexaopais.token';
const CHAVE_USUARIO = 'conexaopais.usuario';

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
