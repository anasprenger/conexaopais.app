import { api, query } from './api';
import { artigoDaApi, comentarioDaApi } from './formatadores';

// Entidade principal: CRUD de artigos (GET, POST, PUT e DELETE em /api/artigos).
// Ler é aberto; criar, editar, excluir, comentar e curtir vão com o token (Bearer) e a API confere o nível.
// O "id" de um artigo no app é o slug dele (veja formatadores.js).

const rota = (id) => `/artigos/${encodeURIComponent(id)}`;

export async function listarArtigos({ busca, categoria, autorId } = {}) {
  const artigos = await api(`/artigos${query({ busca, categoria, autorId })}`);
  return artigos.map(artigoDaApi);
}

export async function buscarArtigo(id) {
  return artigoDaApi(await api(rota(id)));
}

// dados: { titulo, categoria, resumo, conteudo }. O autor é quem está logado (a API lê do token).
export async function criarArtigo(dados) {
  return artigoDaApi(await api('/artigos', { method: 'POST', body: dados }));
}

export async function atualizarArtigo(id, dados) {
  return artigoDaApi(await api(rota(id), { method: 'PUT', body: dados }));
}

// Artigo do banco: é excluído. Artigo de exemplo do site (só admin): fica escondido, no app e no site.
export async function excluirArtigo(id) {
  await api(rota(id), { method: 'DELETE' });
}

export function listarCategorias() {
  return api('/categorias');
}

export async function listarComentarios(artigoId) {
  const comentarios = await api(`${rota(artigoId)}/comentarios`);
  return comentarios.map(comentarioDaApi);
}

export async function comentar(artigoId, texto) {
  return comentarioDaApi(await api(`${rota(artigoId)}/comentarios`, { method: 'POST', body: { texto } }));
}

export async function excluirComentario(id) {
  await api(`/comentarios/${id}`, { method: 'DELETE' });
}

// Liga/desliga curtida ou salvo da conta logada. Devolve { ativo, total }
export function alternarInteracao(artigoId, tipo) {
  return api(`${rota(artigoId)}/interacoes`, { method: 'POST', body: { tipo } });
}
