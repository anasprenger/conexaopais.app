import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';

// Carrega dados da API e controla os estados de carregamento e erro.
// deps: quando mudam, os dados são buscados de novo (ex.: o id do artigo).
// recarregarAoFocar: busca de novo sempre que a tela volta a ficar visível.
export function useApi(carregar, deps = [], { recarregarAoFocar = false } = {}) {
  const [estado, setEstado] = useState({ data: null, loading: true, error: null });
  const montado = useRef(true);
  const primeiraVez = useRef(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const buscar = useCallback(carregar, deps);

  const reload = useCallback(async () => {
    setEstado((atual) => ({ ...atual, loading: true, error: null }));
    try {
      const data = await buscar();
      if (montado.current) setEstado({ data, loading: false, error: null });
    } catch (error) {
      if (montado.current) setEstado((atual) => ({ ...atual, loading: false, error }));
    }
  }, [buscar]);

  useEffect(() => {
    montado.current = true;
    reload();
    return () => {
      montado.current = false;
    };
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      if (primeiraVez.current) {
        primeiraVez.current = false;
        return;
      }
      if (recarregarAoFocar) reload();
    }, [recarregarAoFocar, reload])
  );

  return { ...estado, reload };
}

// Espera o usuário parar de digitar antes de usar o valor (ex.: busca na API)
export function useDebouncedValue(valor, atraso = 350) {
  const [atual, setAtual] = useState(valor);
  useEffect(() => {
    const timer = setTimeout(() => setAtual(valor), atraso);
    return () => clearTimeout(timer);
  }, [valor, atraso]);
  return atual;
}
