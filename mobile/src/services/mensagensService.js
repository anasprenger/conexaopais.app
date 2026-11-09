import { api } from './api';

// tipo: "contato" (aberto a todos) ou "pergunta" (exige login).
// Com login, a API liga a mensagem à conta pelo token.
export function enviarMensagem({ tipo, nome, email, assunto, mensagem }) {
  return api('/mensagens', { method: 'POST', body: { tipo, nome, email, assunto, mensagem } });
}
