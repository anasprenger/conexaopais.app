import { createContext, useContext, useEffect, useState } from 'react';
import { alternarInteracao } from '../services/artigosService';
import { listarInteracoes } from '../services/usuariosService';
import { useAuth } from './AuthContext';
import { useContent } from './ContentContext';

const CommunityContext = createContext(null);

// Curtidas e conteúdos salvos do usuário logado (tabela "interacoes" no banco)
export function CommunityProvider({ children }) {
  const { user } = useAuth();
  const { artigos, patchArtigo } = useContent();
  const [interacoes, setInteracoes] = useState([]); // [{ publicacaoId, tipo }]

  // GET /api/usuarios/:id/interacoes depois do login
  useEffect(() => {
    setInteracoes([]);
    if (!user) return undefined;
    let ativo = true; // ignora a resposta se a pessoa sair ou trocar de conta antes
    listarInteracoes(user.id)
      .then((lista) => ativo && setInteracoes(lista))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function isActive(tipo, artigoId) {
    return interacoes.some((item) => item.tipo === tipo && item.publicacaoId === artigoId);
  }

  // POST /api/artigos/:id/interacoes — liga/desliga e atualiza o total no artigo
  async function toggle(tipo, artigoId) {
    const { ativo, total } = await alternarInteracao(artigoId, user.id, tipo);
    setInteracoes((atual) => {
      const sem = atual.filter((item) => !(item.tipo === tipo && item.publicacaoId === artigoId));
      return ativo ? [{ publicacaoId: artigoId, tipo }, ...sem] : sem;
    });
    patchArtigo(artigoId, { [tipo === 'curtida' ? 'curtidas' : 'salvos']: total });
    return { ativo, total };
  }

  // Artigos mais curtidos ou mais salvos (como o ranking da página Comunidade do site)
  function ranking(tipo, limite = 3) {
    const campo = tipo === 'curtida' ? 'curtidas' : 'salvos';
    return artigos
      .filter((artigo) => artigo[campo] > 0)
      .sort((a, b) => b[campo] - a[campo])
      .slice(0, limite)
      .map((artigo) => ({ artigoId: artigo.id, total: artigo[campo] }));
  }

  function savedIds() {
    return interacoes.filter((item) => item.tipo === 'salvo').map((item) => item.publicacaoId);
  }

  return (
    <CommunityContext.Provider value={{ isActive, toggle, ranking, savedIds }}>{children}</CommunityContext.Provider>
  );
}

export function useCommunity() {
  return useContext(CommunityContext);
}
