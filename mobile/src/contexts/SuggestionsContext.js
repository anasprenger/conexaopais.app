import { createContext, useContext, useState } from 'react';
import { suggestions as initialSuggestions } from '../data/suggestions';

const SuggestionsContext = createContext(null);

// Sugestões de expressões enviadas pelos responsáveis (em memória até a integração com a API)
export function SuggestionsProvider({ children }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);

  function addSuggestion({ term, category, context, author }) {
    const suggestion = {
      id: Date.now(),
      term: term.trim(),
      category,
      context: context.trim(),
      author: author.name,
      authorEmail: author.email,
      status: 'pendente',
    };
    setSuggestions((current) => [suggestion, ...current]);
  }

  return (
    <SuggestionsContext.Provider value={{ suggestions, addSuggestion }}>
      {children}
    </SuggestionsContext.Provider>
  );
}

export function useSuggestions() {
  return useContext(SuggestionsContext);
}
