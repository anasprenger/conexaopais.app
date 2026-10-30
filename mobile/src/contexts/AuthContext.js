import { createContext, useContext, useState } from 'react';

// Níveis de usuário (os mesmos papéis do site: tabela user_roles / enum app_role)
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

// Contas de demonstração (as mesmas contas de teste do site).
// Entrega 1: login simulado. Entrega 3: POST /auth/login devolve um JWT, guardado no aparelho
// e enviado como Bearer Token; a senha fica salva com hash no banco.
export const DEMO_ACCOUNTS = {
  usuario: { email: 'familia@conexaopais.test', password: '123456' },
  profissional: { email: 'profissional@conexaopais.test', password: '123456' },
  admin: { email: 'admin@conexaopais.test', password: '123456' },
};

const initialUsers = [
  {
    id: 1,
    name: 'Ana Sprenger',
    email: DEMO_ACCOUNTS.admin.email,
    role: ROLES.ADMIN,
    verificacao: 'aprovado',
  },
  {
    id: 2,
    name: 'Dra. Helena Prado',
    email: DEMO_ACCOUNTS.profissional.email,
    role: ROLES.PROFISSIONAL,
    profissao: 'Psicóloga',
    registro: 'CRP 07/123456',
    verificacao: 'aprovado',
  },
  {
    id: 3,
    name: 'Marina Souza',
    email: DEMO_ACCOUNTS.usuario.email,
    role: ROLES.USUARIO,
    verificacao: 'aprovado',
  },
  // Cadastros profissionais de exemplo, aguardando a análise da administração
  {
    id: 4,
    name: 'Carla Mendes',
    email: 'carla.mendes@exemplo.com',
    role: ROLES.PROFISSIONAL,
    profissao: 'Fonoaudióloga',
    registro: 'CRFa 2-12345',
    verificacao: 'pendente',
  },
  {
    id: 5,
    name: 'Paulo Ribeiro',
    email: 'paulo.ribeiro@exemplo.com',
    role: ROLES.PROFISSIONAL,
    profissao: 'Nutricionista',
    registro: 'CRN-3 45678',
    verificacao: 'pendente',
  },
];

// Regras de permissão usadas nas telas (na Entrega 3 o back-end aplica as mesmas regras)
export function canPublish(user) {
  return user?.role === ROLES.ADMIN || (user?.role === ROLES.PROFISSIONAL && user.verificacao === 'aprovado');
}

export function canEditArticle(user, artigo) {
  return user?.role === ROLES.ADMIN || (canPublish(user) && artigo.autorId === user.id);
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(initialUsers);
  const [userId, setUserId] = useState(null);

  const user = users.find((item) => item.id === userId) ?? null;

  // Login simulado: e-mail cadastrado entra com a conta dele; e-mail novo entra como família
  function signIn(email) {
    const normalized = email.trim().toLowerCase();
    const found = users.find((item) => item.email === normalized);
    if (found) {
      setUserId(found.id);
      return;
    }
    const newUser = { id: Date.now(), name: normalized.split('@')[0], email: normalized, role: ROLES.USUARIO, verificacao: 'aprovado' };
    setUsers((current) => [...current, newUser]);
    setUserId(newUser.id);
  }

  // Cadastro: conta de família é liberada na hora; conta profissional fica "pendente" até a administração aprovar
  function signUp({ name, email, tipo, profissao, registro }) {
    const isProfissional = tipo === ROLES.PROFISSIONAL;
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: isProfissional ? ROLES.PROFISSIONAL : ROLES.USUARIO,
      verificacao: isProfissional ? 'pendente' : 'aprovado',
      ...(isProfissional && { profissao: profissao.trim(), registro: registro.trim() }),
    };
    setUsers((current) => [...current.filter((item) => item.email !== newUser.email), newUser]);
  }

  function signOut() {
    setUserId(null);
  }

  // Decisão da administração sobre um cadastro profissional
  function reviewProfessional(id, verificacao, observacao = '') {
    setUsers((current) => current.map((item) => (item.id === id ? { ...item, verificacao, observacao } : item)));
  }

  const value = {
    user,
    users,
    isAdmin: user?.role === ROLES.ADMIN,
    canPublish: canPublish(user),
    signIn,
    signUp,
    signOut,
    reviewProfessional,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
