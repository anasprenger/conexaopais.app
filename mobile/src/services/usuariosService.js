import { api, query } from './api';
import { usuarioDaApi } from './formatadores';

// Login: a API confere e-mail e senha. Na Entrega 3 ela devolve também o token JWT.
export async function entrar(email, senha) {
  const { usuario } = await api('/auth/login', { method: 'POST', body: { email, senha } });
  return usuarioDaApi(usuario);
}

// dados: { nome, email, senha, tipo, profissao, registro }
export async function cadastrar(dados) {
  const { usuario } = await api('/usuarios', { method: 'POST', body: dados });
  return usuarioDaApi(usuario);
}

export async function buscarUsuario(id) {
  return usuarioDaApi(await api(`/usuarios/${id}`));
}

export async function listarContasProfissionais(verificacao) {
  const usuarios = await api(`/usuarios${query({ nivel: 'profissional', verificacao })}`);
  return usuarios.map(usuarioDaApi);
}

export async function avaliarProfissional(id, verificacao, observacao) {
  return usuarioDaApi(await api(`/usuarios/${id}/verificacao`, { method: 'PATCH', body: { verificacao, observacao } }));
}

// Curtidas e salvos do usuário: [{ publicacaoId, tipo }]
export function listarInteracoes(usuarioId) {
  return api(`/usuarios/${usuarioId}/interacoes`);
}
