import { createContext, useContext, useState } from 'react';
import { dataCurta } from '../utils/text';

const CommunityContext = createContext(null);

// Interações das contas de demonstração (como a tabela "interacoes" do site: curtida e salvo)
const interacoesIniciais = [
  { userId: 3, artigoId: 1, tipo: 'curtida' },
  { userId: 3, artigoId: 1, tipo: 'salvo' },
  { userId: 3, artigoId: 4, tipo: 'curtida' },
  { userId: 1, artigoId: 1, tipo: 'curtida' },
  { userId: 2, artigoId: 2, tipo: 'curtida' },
  { userId: 1, artigoId: 3, tipo: 'salvo' },
];

const comentariosIniciais = [
  {
    id: 1,
    artigoId: 1,
    userId: 3,
    autor: 'Marina Souza',
    texto: 'A parte de descrever sem julgar mudou as conversas aqui em casa. Obrigada pelo texto!',
    data: '14 ago 2026',
  },
  {
    id: 2,
    artigoId: 1,
    userId: 2,
    autor: 'Dra. Helena Prado',
    texto: 'Que bom saber, Marina! Com o tempo, a própria criança começa a usar essas palavras.',
    data: '15 ago 2026',
  },
];

// Curtidas, conteúdos salvos e comentários (em memória até a integração com a API)
export function CommunityProvider({ children }) {
  const [interacoes, setInteracoes] = useState(interacoesIniciais);
  const [comentarios, setComentarios] = useState(comentariosIniciais);

  function isActive(user, tipo, artigoId) {
    return interacoes.some((i) => i.userId === user?.id && i.tipo === tipo && i.artigoId === artigoId);
  }

  function toggle(user, tipo, artigoId) {
    setInteracoes((current) =>
      isActive(user, tipo, artigoId)
        ? current.filter((i) => !(i.userId === user.id && i.tipo === tipo && i.artigoId === artigoId))
        : [...current, { userId: user.id, artigoId, tipo }]
    );
  }

  function count(tipo, artigoId) {
    return interacoes.filter((i) => i.tipo === tipo && i.artigoId === artigoId).length;
  }

  // Artigos mais curtidos ou mais salvos (como o ranking da página Comunidade do site)
  function ranking(tipo, limite = 3) {
    const totais = {};
    interacoes.filter((i) => i.tipo === tipo).forEach((i) => (totais[i.artigoId] = (totais[i.artigoId] ?? 0) + 1));
    return Object.entries(totais)
      .map(([artigoId, total]) => ({ artigoId: Number(artigoId), total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limite);
  }

  function savedIds(user) {
    return interacoes.filter((i) => i.userId === user?.id && i.tipo === 'salvo').map((i) => i.artigoId);
  }

  function comentariosDo(artigoId) {
    return comentarios.filter((c) => c.artigoId === artigoId);
  }

  function addComentario(user, artigoId, texto) {
    const novo = { id: Date.now(), artigoId, userId: user.id, autor: user.name, texto: texto.trim(), data: dataCurta() };
    setComentarios((current) => [...current, novo]);
  }

  function deleteComentario(id) {
    setComentarios((current) => current.filter((c) => c.id !== id));
  }

  const value = { isActive, toggle, count, ranking, savedIds, comentariosDo, addComentario, deleteComentario };

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  return useContext(CommunityContext);
}
