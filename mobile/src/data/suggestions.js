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
    context: 'Meu filho faz um gesto de silêncio e passa a mão no queixo quando fala isso.',
    author: 'Marina (mãe)',
    status: 'pendente',
  },
  {
    id: 2,
    term: 'Farmar aura',
    context: 'Ouvi minha filha falando que uma colega estava "farmando aura".',
    author: 'Carlos (pai)',
    status: 'pendente',
  },
  {
    id: 3,
    term: 'Pdp',
    context: 'Aparece muito nas mensagens do grupo da família.',
    author: 'Rosa (avó)',
    status: 'aprovada',
  },
];
