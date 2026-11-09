import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Endereço padrão da API:
// 1. EXPO_PUBLIC_API_URL (arquivo .env do app ou "env" do eas.json no APK), se existir;
// 2. no celular (Expo Go), o IP do computador que está rodando o Expo, na porta 3333;
// 3. no navegador, localhost.
// A pessoa pode trocar o endereço na tela "Conexão com a API" (útil no APK, quando o IP do notebook muda).
function descobrirUrlDaApi() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && Platform.OS !== 'web') return `http://${host}:3333/api`;
  return 'http://localhost:3333/api';
}

const URL_PADRAO = descobrirUrlDaApi();
let urlAtual = URL_PADRAO;

export function obterUrlDaApi() {
  return urlAtual;
}

export function urlPadraoDaApi() {
  return URL_PADRAO;
}

// null volta para o endereço padrão
export function definirUrlDaApi(url) {
  urlAtual = url || URL_PADRAO;
}

// Completa o que a pessoa digitou: "192.168.0.15" vira "http://192.168.0.15:3333/api"
export function normalizarUrlDaApi(texto) {
  let url = String(texto ?? '').trim().replace(/\/+$/, '');
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  const [, origem, caminho = ''] = url.match(/^(https?:\/\/[^/]+)(\/.*)?$/i) ?? [null, url];
  const temPorta = /:\d+$/.test(origem);
  const ehHttps = /^https:/i.test(origem);
  return `${origem}${temPorta || ehHttps ? '' : ':3333'}${caminho || '/api'}`;
}

// GET /status num endereço qualquer (antes de salvar). Devolve { api, banco } ou lança ApiError.
export async function testarConexao(url, timeout = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const resposta = await fetch(`${url}/status`, { headers: { Accept: 'application/json' }, signal: controller.signal });
    const dados = await resposta.json().catch(() => null);
    if (!dados?.api) throw new ApiError('Esse endereço respondeu, mas não é a API do Conexão Pais.', resposta.status);
    return dados;
  } catch (erro) {
    if (erro instanceof ApiError) throw erro;
    throw new ApiError(
      erro.name === 'AbortError'
        ? 'A API não respondeu a tempo. Confira o IP, a porta e o firewall do computador.'
        : 'Não foi possível conectar. Confira se a API está rodando e se o celular está no mesmo Wi-Fi.',
      0
    );
  } finally {
    clearTimeout(timer);
  }
}

// Erro vindo da API: message (texto para o usuário), status HTTP e erros por campo
export class ApiError extends Error {
  constructor(message, status, campos) {
    super(message);
    this.status = status;
    this.campos = campos ?? {};
  }
}

// Token JWT da sessão atual (definido pelo AuthContext no login e ao reabrir o app)
let tokenAtual = null;
let aoRecusarToken = null;

export function definirToken(token) {
  tokenAtual = token;
}

export function obterToken() {
  return tokenAtual;
}

// Avisa quando a API recusa o token (401): sessão expirada ou inválida. O AuthContext usa para sair da conta.
export function aoSessaoRecusada(callback) {
  aoRecusarToken = callback;
}

// Requisição à API com fetch(): envia/recebe JSON, manda o token como Bearer Token,
// limita o tempo de espera e transforma qualquer falha em ApiError com uma mensagem clara.
export async function api(caminho, { method = 'GET', body, timeout = 10000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const tokenEnviado = tokenAtual;

  try {
    const resposta = await fetch(`${urlAtual}${caminho}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(tokenEnviado && { Authorization: `Bearer ${tokenEnviado}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null);
    if (!resposta.ok) {
      // Token recusado: só encerra a sessão se ainda for o token atual
      // (se a pessoa saiu ou trocou de conta enquanto esperava, a resposta antiga é ignorada)
      if (resposta.status === 401 && tokenEnviado && tokenEnviado === tokenAtual) aoRecusarToken?.();
      throw new ApiError(dados?.erro ?? 'A API respondeu com um erro inesperado.', resposta.status, dados?.campos);
    }
    return dados;
  } catch (erro) {
    if (erro instanceof ApiError) throw erro;
    const mensagem =
      erro.name === 'AbortError'
        ? 'A API demorou para responder. Tente de novo.'
        : 'Não foi possível conectar à API. Confira se ela está rodando e se o celular está no mesmo Wi-Fi do computador (o endereço pode ser ajustado em "Conexão com a API").';
    throw new ApiError(mensagem, 0);
  } finally {
    clearTimeout(timer);
  }
}

// Monta "?chave=valor" ignorando valores vazios
export function query(params) {
  const partes = Object.entries(params)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([chave, valor]) => `${encodeURIComponent(chave)}=${encodeURIComponent(valor)}`);
  return partes.length ? `?${partes.join('&')}` : '';
}
