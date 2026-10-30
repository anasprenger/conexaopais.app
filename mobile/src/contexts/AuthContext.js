import { createContext, useContext, useState } from 'react';

// Níveis de usuário do sistema
export const ROLES = {
  RESPONSAVEL: 'responsavel',
  ADMIN: 'admin',
};

export const roleLabels = {
  [ROLES.RESPONSAVEL]: 'Responsável',
  [ROLES.ADMIN]: 'Administrador',
};

// Contas de demonstração (Entrega 1).
// Na Entrega 3 o login será feito pela API: POST /auth/login retorna um JWT,
// que será guardado no aparelho e enviado como Bearer Token nas requisições.
export const DEMO_ACCOUNTS = {
  responsavel: { email: 'responsavel@conexaopais.app', password: '123456' },
  admin: { email: 'admin@conexaopais.app', password: '123456' },
};

const initialUsers = [
  { id: 1, name: 'Equipe Conexão Pais', email: DEMO_ACCOUNTS.admin.email, relation: 'Curadoria', role: ROLES.ADMIN },
  { id: 2, name: 'Marina Souza', email: DEMO_ACCOUNTS.responsavel.email, relation: 'Mãe', role: ROLES.RESPONSAVEL },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);

  // Login simulado: aceita qualquer e-mail cadastrado ou novo. Contas novas entram como responsável.
  function signIn(email) {
    const normalized = email.trim().toLowerCase();
    const found = users.find((item) => item.email === normalized);

    setUser(
      found ?? {
        id: Date.now(),
        name: normalized.split('@')[0],
        email: normalized,
        relation: 'Responsável',
        role: ROLES.RESPONSAVEL,
      }
    );
  }

  // Cadastro simulado: guarda o usuário apenas em memória. Todo cadastro novo é do nível "responsável".
  function signUp({ name, email, relation }) {
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      relation,
      role: ROLES.RESPONSAVEL,
    };
    setUsers((current) => [...current.filter((item) => item.email !== newUser.email), newUser]);
  }

  function signOut() {
    setUser(null);
  }

  const value = {
    user,
    isAdmin: user?.role === ROLES.ADMIN,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
