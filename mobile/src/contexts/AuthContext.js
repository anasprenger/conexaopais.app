import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { aoSessaoRecusada, definirToken, obterToken } from '../services/api';
import { apagarSessao, lerSessao, salvarSessao } from '../services/sessao';
import { buscarPerfil, cadastrar, entrar } from '../services/usuariosService';

// Níveis de usuário (coluna "nivel" da tabela usuarios)
export const ROLES = {
  USUARIO: 'usuario',
  PROFISSIONAL: 'profissional',
  ADMIN: 'admin',
};

export const roleLabels = {
  [ROLES.USUARIO]: 'Responsável / família',
  [ROLES.PROFISSIONAL]: 'Profissional parceiro',
  [ROLES.ADMIN]: 'Administração',
};

// Situação do cadastro profissional (verificada pela administração)
export const verificacaoLabels = {
  pendente: 'Em verificação',
  aprovado: 'Aprovado',
  ajustes_solicitados: 'Ajustes solicitados',
  recusado: 'Recusado',
};

// Contas de demonstração criadas pelo seed do banco (database/seed.sql)
export const DEMO_ACCOUNTS = {
  usuario: { email: 'familia@conexaopais.test', password: '123456' },
  profissional: { email: 'profissional@conexaopais.test', password: '123456' },
  admin: { email: 'admin@conexaopais.test', password: '123456' },
};

// Regras de permissão usadas nas telas, para mostrar só o que cada nível pode fazer.
// Quem garante as permissões é a API (middlewares de autenticação e de nível); estas funções só ajustam a interface.
export function canPublish(user) {
  return user?.role === ROLES.ADMIN || (user?.role === ROLES.PROFISSIONAL && user.verificacao === 'aprovado');
}

export function canEditArticle(user, artigo) {
  return user?.role === ROLES.ADMIN || (canPublish(user) && artigo.autorId === user.id);
}

const AuthContext = createContext(null);

// Sessão com JWT:
// 1. signIn: a API confere e-mail e senha (bcrypt) e devolve um token JWT;
// 2. o token fica guardado no aparelho (services/sessao.js) e vai em toda requisição como Bearer Token (services/api.js);
// 3. ao reabrir o app, a sessão guardada é recuperada e conferida na API (GET /auth/perfil);
// 4. signOut (logout) apaga o token; se a API recusar o token (expirado), a sessão também é encerrada.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restaurando, setRestaurando] = useState(true); // lendo a sessão guardada ao abrir o app
  const [sessaoExpirada, setSessaoExpirada] = useState(false);

  // Tira o token da memória (as próximas requisições saem sem Bearer Token) e apaga a sessão do aparelho
  const encerrarSessao = useCallback(async () => {
    definirToken(null);
    setUser(null);
    await apagarSessao();
  }, []);

  // Busca de novo os dados da conta (ex.: depois que a administração aprova o cadastro profissional).
  // Se a pessoa sair ou trocar de conta antes da resposta chegar, a resposta é ignorada.
  const refreshUser = useCallback(async () => {
    const token = obterToken();
    if (!token) return;
    const atualizado = await buscarPerfil();
    if (obterToken() !== token) return;
    setUser(atualizado);
    await salvarSessao({ token, usuario: atualizado });
  }, []);

  // Se a API recusar o token em qualquer requisição (401: sessão expirada ou inválida), sai da conta
  useEffect(() => {
    aoSessaoRecusada(() => {
      setSessaoExpirada(true);
      encerrarSessao();
    });
    return () => aoSessaoRecusada(null);
  }, [encerrarSessao]);

  // Ao abrir o app: recupera a sessão guardada e confere com a API se o token ainda vale
  useEffect(() => {
    let ativo = true;
    (async () => {
      const sessao = await lerSessao();
      if (!ativo) return;
      if (sessao) {
        definirToken(sessao.token);
        setUser(sessao.usuario);
        // Token vencido: a API responde 401 e a sessão é encerrada (efeito acima).
        // Sem conexão: a sessão guardada continua e as telas oferecem "Tentar de novo".
        refreshUser().catch(() => {});
      }
      setRestaurando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [refreshUser]);

  async function signIn(email, senha) {
    const { token, usuario } = await entrar(email.trim().toLowerCase(), senha);
    definirToken(token); // antes de setUser: as telas que carregam ao entrar já enviam o token
    await salvarSessao({ token, usuario });
    setSessaoExpirada(false);
    setUser(usuario);
  }

  // Cadastro: conta de família é liberada na hora; conta profissional fica "pendente" até a administração aprovar
  function signUp({ name, email, tipo, profissao, registro, password }) {
    return cadastrar({ nome: name.trim(), email: email.trim().toLowerCase(), senha: password, tipo, profissao, registro });
  }

  // Logout
  async function signOut() {
    setSessaoExpirada(false);
    await encerrarSessao();
  }

  const value = {
    user,
    restaurando,
    sessaoExpirada,
    isAdmin: user?.role === ROLES.ADMIN,
    canPublish: canPublish(user),
    signIn,
    signUp,
    refreshUser,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
