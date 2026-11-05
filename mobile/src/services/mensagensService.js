import { api } from './api';

// tipo: "contato" ou "pergunta"
export function enviarMensagem({ tipo, nome, email, assunto, mensagem, usuarioId }) {
  return api('/mensagens', { method: 'POST', body: { tipo, nome, email, assunto, mensagem, usuarioId } });
}
