// Sugestões de expressões enviadas pelos responsáveis (dados de exemplo)

export const suggestionStatus = {
  pendente: { label: 'Pendente', icon: 'time' },
  aprovada: { label: 'Aprovada', icon: 'checkmark-circle' },
  recusada: { label: 'Recusada', icon: 'close-circle' },
};

export const suggestions = [
  {
    id: 1,
    term: 'Mewing',
    category: 'tendencia',
    context: 'Meu filho faz um gesto de silêncio e passa a mão no queixo quando fala isso.',
    author: 'Carlos Lima',
    authorEmail: 'carlos@exemplo.com',
    status: 'pendente',
  },
  {
    id: 2,
    term: 'Farmar aura',
    category: 'giria',
    context: 'Ouvi minha filha falando que uma colega estava "farmando aura".',
    author: 'Rosa Alves',
    authorEmail: 'rosa@exemplo.com',
    status: 'pendente',
  },
  {
    id: 3,
    term: 'Pdp',
    category: 'abreviacao',
    context: 'Aparece muito nas mensagens do grupo da família.',
    author: 'Marina Souza',
    authorEmail: 'responsavel@conexaopais.app',
    status: 'aprovada',
  },
];
