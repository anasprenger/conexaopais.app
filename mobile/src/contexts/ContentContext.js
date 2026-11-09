import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  atualizarArtigo,
  criarArtigo,
  excluirArtigo,
  listarArtigos,
  listarCategorias,
} from '../services/artigosService';

const ContentContext = createContext(null);

export const categoriasPadrao = ['Desenvolvimento', 'Gerações', 'Educação', 'Convivência'];

// Lista de artigos (entidade principal) carregada da API e as operações de CRUD:
// GET /api/artigos, POST /api/artigos, PUT /api/artigos/:id e DELETE /api/artigos/:id
export function ContentProvider({ children }) {
  const [artigos, setArtigos] = useState([]);
  const [categoriasApi, setCategoriasApi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lista, categorias] = await Promise.all([listarArtigos(), listarCategorias()]);
      setArtigos(lista);
      setCategoriasApi(categorias);
    } catch (falha) {
      setError(falha);
    } finally {
      setLoading(false);
    }
  }, []);

  // Os conteúdos são públicos: carregam ao abrir o app, mesmo sem login
  useEffect(() => {
    reload();
  }, [reload]);

  const categorias = [...new Set([...categoriasPadrao, ...categoriasApi])];

  function getArtigo(id) {
    return artigos.find((artigo) => artigo.id === id);
  }

  // Cria (POST) ou atualiza (PUT) e recarrega a lista. Devolve o id do artigo.
  async function saveArtigo(dados) {
    const salvo = dados.id ? await atualizarArtigo(dados.id, dados) : await criarArtigo(dados);
    await reload();
    return salvo.id;
  }

  async function deleteArtigo(id) {
    await excluirArtigo(id);
    setArtigos((atual) => atual.filter((artigo) => artigo.id !== id));
  }

  // Atualiza os totais de um artigo sem buscar a lista inteira de novo (ex.: depois de curtir)
  function patchArtigo(id, campos) {
    setArtigos((atual) => atual.map((artigo) => (artigo.id === id ? { ...artigo, ...campos } : artigo)));
  }

  const value = { artigos, categorias, loading, error, reload, getArtigo, saveArtigo, deleteArtigo, patchArtigo };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}
