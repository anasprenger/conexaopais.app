import { api, query } from './api';
import { usuarioDaApi } from './formatadores';

// Login: a API confere e-mail e senha e devolve o token JWT e os dados da conta
export async function entrar(email, senha) {
  const { token, usuario } = await api('/auth/login', { method: 'POST', body: { email, senha } });
  return { token, usuario: usuarioDaApi(usuario) };
}

// Quem está logado, segundo o token enviado (GET /auth/perfil). Falha com 401 se o token não vale mais.
export async function buscarPerfil() {
  return usuarioDaApi(await api('/auth/perfil'));
}

// dados: { nome, email, senha, tipo, profissao, registro }
export async function cadastrar(dados) {
  const { usuario } = await api('/usuarios', { method: 'POST', body: dados });
  return usuarioDaApi(usuario);
}

export async function listarContasProfissionais(verificacao) {
  const usuarios = await api(`/usuarios${query({ nivel: 'profissional', verificacao })}`);
  return usuarios.map(usuarioDaApi);
}

export async function avaliarProfissional(id, verificacao, observacao) {
  return usuarioDaApi(await api(`/usuarios/${id}/verificacao`, { method: 'PATCH', body: { verificacao, observacao } }));
}

// Curtidas e salvos do usuário logado: [{ publicacaoId, tipo }] (a API só mostra os da própria conta)
export function listarInteracoes(usuarioId) {
  return api(`/usuarios/${usuarioId}/interacoes`);
}
