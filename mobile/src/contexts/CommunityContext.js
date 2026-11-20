import { createContext, useContext, useEffect, useState } from 'react';
import { alternarInteracao } from '../services/artigosService';
import { alternarInteracaoColuna } from '../services/conteudoService';
import { listarInteracoes } from '../services/usuariosService';
import { useAuth } from './AuthContext';
import { useContent } from './ContentContext';

const CommunityContext = createContext(null);

// Curtidas e conteúdos salvos do usuário logado (tabela "interacoes" do banco do site, ligada ao slug do artigo)
export function CommunityProvider({ children }) {
  const { user } = useAuth();
  const { artigos, patchArtigo } = useContent();
  // [{ publicacaoSlug, tipo }]; nas publicações de colunas, também { coluna: { slug, nome }, titulo }
  const [interacoes, setInteracoes] = useState([]);

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
    return interacoes.some((item) => item.tipo === tipo && item.publicacaoSlug === artigoId);
  }

  // POST /api/artigos/:slug/interacoes — liga/desliga e atualiza o total no artigo
  async function toggle(tipo, artigoId) {
    if (!user) throw new Error('Entre na sua conta para curtir e salvar conteúdos.');
    const { ativo, total } = await alternarInteracao(artigoId, tipo);
    setInteracoes((atual) => {
      const sem = atual.filter((item) => !(item.tipo === tipo && item.publicacaoSlug === artigoId));
      return ativo ? [{ publicacaoSlug: artigoId, tipo }, ...sem] : sem;
    });
    patchArtigo(artigoId, { [tipo === 'curtida' ? 'curtidas' : 'salvos']: total });
    return { ativo, total };
  }

  // POST /api/colunas/:slug/posts/:postSlug/interacoes — curtir ou salvar uma publicação da coluna
  async function toggleColuna(tipo, coluna, post) {
    if (!user) throw new Error('Entre na sua conta para curtir e salvar conteúdos.');
    const { ativo } = await alternarInteracaoColuna(coluna.slug, post.slug, tipo);
    setInteracoes((atual) => {
      const sem = atual.filter((item) => !(item.tipo === tipo && item.publicacaoSlug === post.slug));
      const item = { publicacaoSlug: post.slug, tipo, coluna: { slug: coluna.slug, nome: coluna.nome }, titulo: post.titulo };
      return ativo ? [item, ...sem] : sem;
    });
    return { ativo };
  }

  // Publicações de colunas salvas (aparecem em "Minha conta" junto com os artigos salvos)
  function salvosDeColunas() {
    return interacoes.filter((item) => item.tipo === 'salvo' && item.coluna);
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
    return interacoes.filter((item) => item.tipo === 'salvo').map((item) => item.publicacaoSlug);
  }

  return (
    <CommunityContext.Provider value={{ isActive, toggle, toggleColuna, ranking, savedIds, salvosDeColunas }}>{children}</CommunityContext.Provider>
  );
}

export function useCommunity() {
  return useContext(CommunityContext);
}
