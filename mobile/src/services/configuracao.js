import armazenamento from './armazenamento';

// Endereço da API escolhido na tela "Conexão com a API" (fica guardado no aparelho)
const CHAVE_URL = 'conexaopais.api-url';

export async function lerUrlSalva() {
  try {
    return await armazenamento.getItemAsync(CHAVE_URL);
  } catch {
    return null;
  }
}

export async function salvarUrl(url) {
  try {
    if (url) await armazenamento.setItemAsync(CHAVE_URL, url);
    else await armazenamento.deleteItemAsync(CHAVE_URL);
  } catch {
    // sem armazenamento, o endereço vale só até fechar o app
  }
}
