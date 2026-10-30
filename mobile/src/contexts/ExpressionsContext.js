import { createContext, useContext, useState } from 'react';
import { initialExpressions } from '../data/expressions';

const ExpressionsContext = createContext(null);

// Estado da entidade principal (Expressão) com as operações de CRUD.
// Entrega 1: dados em memória. Entrega 2: estas funções passam a chamar a API com fetch()
// (GET/POST/PUT/DELETE /expressoes), sem precisar mudar as telas.
export function ExpressionsProvider({ children }) {
  const [expressions, setExpressions] = useState(initialExpressions);

  function getExpression(id) {
    return expressions.find((expression) => expression.id === id);
  }

  function saveExpression(data) {
    if (data.id) {
      setExpressions((current) => current.map((item) => (item.id === data.id ? { ...item, ...data } : item)));
      return data.id;
    }
    const id = Date.now();
    setExpressions((current) => [...current, { ...data, id }]);
    return id;
  }

  function deleteExpression(id) {
    setExpressions((current) => current.filter((item) => item.id !== id));
  }

  return (
    <ExpressionsContext.Provider value={{ expressions, getExpression, saveExpression, deleteExpression }}>
      {children}
    </ExpressionsContext.Provider>
  );
}

export function useExpressions() {
  return useContext(ExpressionsContext);
}
