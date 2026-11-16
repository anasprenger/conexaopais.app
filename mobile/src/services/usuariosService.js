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
// Devolve { usuario, confirmarEmail }: confirmarEmail = true quando a conta precisa confirmar o e-mail antes de entrar
export async function cadastrar(dados) {
  const { usuario, confirmarEmail } = await api('/usuarios', { method: 'POST', body: dados });
  return { usuario: usuario && usuarioDaApi(usuario), confirmarEmail: Boolean(confirmarEmail) };
}

export async function listarContasProfissionais(verificacao) {
  const usuarios = await api(`/usuarios${query({ nivel: 'profissional', verificacao })}`);
  return usuarios.map(usuarioDaApi);
}

// verificacao: "aprovado" ou "recusado" (mesma decisão do painel "Novos profissionais" do site)
export async function avaliarProfissional(id, verificacao) {
  return usuarioDaApi(await api(`/usuarios/${id}/verificacao`, { method: 'PATCH', body: { verificacao } }));
}

// Curtidas e salvos do usuário logado: [{ publicacaoSlug, tipo }] (a API só mostra os da própria conta)
export function listarInteracoes(usuarioId) {
  return api(`/usuarios/${usuarioId}/interacoes`);
}
