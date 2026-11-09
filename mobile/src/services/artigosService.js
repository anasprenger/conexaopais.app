import { api, query } from './api';
import { artigoDaApi, comentarioDaApi } from './formatadores';

// Entidade principal: CRUD de artigos (GET, POST, PUT e DELETE em /api/artigos).
// Ler é aberto; criar, editar, excluir, comentar e curtir vão com o token (Bearer) e a API confere o nível.

export async function listarArtigos({ busca, categoria, autorId } = {}) {
  const artigos = await api(`/artigos${query({ busca, categoria, autorId })}`);
  return artigos.map(artigoDaApi);
}

export async function buscarArtigo(id) {
  return artigoDaApi(await api(`/artigos/${id}`));
}

// dados: { titulo, categoria, resumo, conteudo, tags }. O autor é quem está logado (a API lê do token).
export async function criarArtigo(dados) {
  return artigoDaApi(await api('/artigos', { method: 'POST', body: dados }));
}

export async function atualizarArtigo(id, dados) {
  return artigoDaApi(await api(`/artigos/${id}`, { method: 'PUT', body: dados }));
}

export async function excluirArtigo(id) {
  await api(`/artigos/${id}`, { method: 'DELETE' });
}

export function listarCategorias() {
  return api('/categorias');
}

export async function listarComentarios(artigoId) {
  const comentarios = await api(`/artigos/${artigoId}/comentarios`);
  return comentarios.map(comentarioDaApi);
}

export async function comentar(artigoId, texto) {
  return comentarioDaApi(await api(`/artigos/${artigoId}/comentarios`, { method: 'POST', body: { texto } }));
}

export async function excluirComentario(id) {
  await api(`/comentarios/${id}`, { method: 'DELETE' });
}

// Liga/desliga curtida ou salvo da conta logada. Devolve { ativo, total }
export function alternarInteracao(artigoId, tipo) {
  return api(`/artigos/${artigoId}/interacoes`, { method: 'POST', body: { tipo } });
}
