// Dicas de conversa entre gerações (conteúdo educativo de exemplo)

export const tips = [
  {
    id: 1,
    tag: 'Diálogo',
    icon: 'help-circle',
    title: 'Pergunte com curiosidade, não com desconfiança',
    summary: 'Ouviu uma expressão nova? Peça para te explicarem.',
    content:
      'Os jovens costumam gostar de ensinar. Perguntar "o que isso quer dizer?" com interesse genuíno inverte os papéis e abre espaço para a conversa. Evite perguntas em tom de interrogatório, como "onde você aprendeu isso?".',
  },
  {
    id: 2,
    tag: 'Diálogo',
    icon: 'chatbubbles',
    title: 'Entender é mais importante do que usar',
    summary: 'Forçar gírias para parecer jovem pode soar "cringe".',
    content:
      'Você não precisa falar como um adolescente. O objetivo é compreender o que está sendo dito e mostrar que você se importa. Se quiser usar uma gíria, faça isso com bom humor e sem exagero.',
  },
  {
    id: 3,
    tag: 'Escuta ativa',
    icon: 'ear',
    title: 'Ouça até o fim antes de responder',
    summary: 'Sem interromper, sem julgar e sem pressa.',
    content:
      'Escuta ativa é prestar atenção de verdade: olhar nos olhos, deixar o celular de lado e, ao final, repetir com suas palavras o que entendeu ("então você ficou chateado porque..."). Isso mostra respeito e evita mal-entendidos.',
  },
  {
    id: 4,
    tag: 'Mediação digital',
    icon: 'game-controller',
    title: 'Conheça os espaços digitais dos jovens',
    summary: 'Peça para te mostrarem o jogo, o app ou o criador favorito.',
    content:
      'Participar, mesmo que por alguns minutos, ajuda a entender as referências, os riscos e as coisas boas daquele ambiente. Fica muito mais fácil orientar sobre algo que você conhece.',
  },
  {
    id: 5,
    tag: 'Mediação digital',
    icon: 'time',
    title: 'Combinem juntos as regras de tela',
    summary: 'Acordos construídos em conjunto funcionam melhor do que proibições.',
    content:
      'Conversem sobre horários, lugares sem celular (como a mesa do jantar) e o que fazer quando algo estranho acontecer on-line. Os adultos também podem seguir os combinados: o exemplo conta muito.',
  },
  {
    id: 6,
    tag: 'Bem-estar',
    icon: 'heart',
    title: 'Fique atento aos sinais',
    summary: 'Algumas expressões podem esconder um pedido de ajuda.',
    content:
      'Mudanças bruscas de humor, isolamento ou frases como "não tô tankando mais" podem indicar que algo não vai bem. Acolha sem minimizar o sentimento e procure ajuda de profissionais da escola ou da saúde quando necessário.',
  },
];

export function getTipOfTheDay(date = new Date()) {
  return tips[date.getDate() % tips.length];
}
