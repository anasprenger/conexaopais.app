import { createContext, useContext, useState } from 'react';
import { buscarUsuario, cadastrar, entrar } from '../services/usuariosService';

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

// Regras de permissão usadas nas telas (a API também confere quem pode publicar)
export function canPublish(user) {
  return user?.role === ROLES.ADMIN || (user?.role === ROLES.PROFISSIONAL && user.verificacao === 'aprovado');
}

export function canEditArticle(user, artigo) {
  return user?.role === ROLES.ADMIN || (canPublish(user) && artigo.autorId === user.id);
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Entrega 2: a API confere e-mail e senha (hash bcrypt) e devolve os dados do usuário.
  // Entrega 3: a API devolve também um JWT, guardado no aparelho e enviado como Bearer Token.
  async function signIn(email, senha) {
    setUser(await entrar(email.trim().toLowerCase(), senha));
  }

  // Cadastro: conta de família é liberada na hora; conta profissional fica "pendente" até a administração aprovar
  function signUp({ name, email, tipo, profissao, registro, password }) {
    return cadastrar({ nome: name.trim(), email: email.trim().toLowerCase(), senha: password, tipo, profissao, registro });
  }

  // Busca de novo os dados do usuário (ex.: depois que a administração aprova o cadastro)
  async function refreshUser() {
    if (user) setUser(await buscarUsuario(user.id));
  }

  function signOut() {
    setUser(null);
  }

  const value = {
    user,
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
