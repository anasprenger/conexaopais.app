import { createContext, useContext, useState } from 'react';
import { artigosIniciais } from '../data/artigos';
import { dataCurta, slugify, tempoLeitura } from '../utils/text';

const ContentContext = createContext(null);

export const categoriasPadrao = ['Desenvolvimento', 'Gerações', 'Educação', 'Convivência'];

function comLeitura(artigo) {
  return { ...artigo, leitura: tempoLeitura([artigo.titulo, artigo.resumo, ...artigo.conteudo]) };
}

// CRUD da entidade principal (publicações do tipo artigo).
// Entrega 1: dados em memória. Entrega 2: GET/POST/PUT/DELETE /artigos com fetch() na API.
export function ContentProvider({ children }) {
  const [artigos, setArtigos] = useState(() => artigosIniciais.map(comLeitura));

  const categorias = [...new Set([...categoriasPadrao, ...artigos.map((artigo) => artigo.categoria)])];

  function getArtigo(id) {
    return artigos.find((artigo) => artigo.id === id);
  }

  function saveArtigo(data, autor) {
    if (data.id) {
      setArtigos((current) => current.map((item) => (item.id === data.id ? comLeitura({ ...item, ...data }) : item)));
      return data.id;
    }
    const id = Date.now();
    const novo = comLeitura({
      ...data,
      id,
      slug: `${slugify(data.titulo)}-${id}`,
      autor: autor.name,
      autorId: autor.id,
      data: dataCurta(),
    });
    setArtigos((current) => [novo, ...current]);
    return id;
  }

  function deleteArtigo(id) {
    setArtigos((current) => current.filter((item) => item.id !== id));
  }

  return (
    <ContentContext.Provider value={{ artigos, categorias, getArtigo, saveArtigo, deleteArtigo }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}
