import { api, query } from './api';
import { artigoDaApi, comentarioDaApi } from './formatadores';

// Entidade principal: CRUD de artigos (GET, POST, PUT e DELETE em /api/artigos)

export async function listarArtigos({ busca, categoria, autorId } = {}) {
  const artigos = await api(`/artigos${query({ busca, categoria, autorId })}`);
  return artigos.map(artigoDaApi);
}

export async function buscarArtigo(id) {
  return artigoDaApi(await api(`/artigos/${id}`));
}

// dados: { titulo, categoria, resumo, conteudo, tags }
export async function criarArtigo(dados, autorId) {
  return artigoDaApi(await api('/artigos', { method: 'POST', body: { ...dados, autorId } }));
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

export async function comentar(artigoId, usuarioId, texto) {
  return comentarioDaApi(await api(`/artigos/${artigoId}/comentarios`, { method: 'POST', body: { usuarioId, texto } }));
}

export async function excluirComentario(id) {
  await api(`/comentarios/${id}`, { method: 'DELETE' });
}

// Liga/desliga curtida ou salvo. Devolve { ativo, total }
export function alternarInteracao(artigoId, usuarioId, tipo) {
  return api(`/artigos/${artigoId}/interacoes`, { method: 'POST', body: { usuarioId, tipo } });
}
