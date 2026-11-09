import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Endereço da API:
// 1. EXPO_PUBLIC_API_URL (arquivo .env do app), se existir;
// 2. no celular (Expo Go), o IP do computador que está rodando o Expo, na porta 3333;
// 3. no navegador, localhost.
function descobrirUrlDaApi() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && Platform.OS !== 'web') return `http://${host}:3333/api`;
  return 'http://localhost:3333/api';
}

export const API_URL = descobrirUrlDaApi();

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
    const resposta = await fetch(`${API_URL}${caminho}`, {
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
        : 'Não foi possível conectar à API. Confira se ela está rodando e se o celular está na mesma rede do computador.';
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
