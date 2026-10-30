import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

// Favoritos guardados em memória, separados por usuário.
// Nas próximas entregas serão salvos no banco de dados via API.
export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favoritesByUser, setFavoritesByUser] = useState({});

  const favoriteIds = favoritesByUser[user?.id] ?? [];

  function isFavorite(id) {
    return favoriteIds.includes(id);
  }

  function toggleFavorite(id) {
    setFavoritesByUser((current) => {
      const ids = current[user.id] ?? [];
      const updated = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
      return { ...current, [user.id]: updated };
    });
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
