import { api } from './api';
import { colunaDaApi, profissionalDaApi, revistaDaApi } from './formatadores';

export async function listarProfissionais() {
  return (await api('/profissionais')).map(profissionalDaApi);
}

export async function buscarProfissional(slug) {
  return profissionalDaApi(await api(`/profissionais/${encodeURIComponent(slug)}`));
}

export async function listarColunas() {
  return (await api('/colunas')).map(colunaDaApi);
}

export async function buscarColuna(slug) {
  return colunaDaApi(await api(`/colunas/${encodeURIComponent(slug)}`));
}

export async function listarRevistas() {
  return (await api('/revistas')).map(revistaDaApi);
}

export async function buscarRevista(slug) {
  return revistaDaApi(await api(`/revistas/${encodeURIComponent(slug)}`));
}
