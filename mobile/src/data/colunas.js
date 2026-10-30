// Colunas assinadas e suas publicações.
// Conteúdo de exemplo trazido do site Conexão Pais (src/data/mock.ts).
// Na Entrega 2 estes dados passam a vir da API (fetch -> Express -> MySQL).

export const colunas = [
  {
    slug: 'entre-geracoes',
    nome: 'Entre Gerações',
    colunista: 'Marcos Vilela',
    chamada: 'Histórias e reflexões sobre o que passa de avós para netos.',
    periodicidade: 'Quinzenal',
    sobre: 'Uma coluna sobre heranças invisíveis: gestos, receitas, silêncios e frases que atravessam três gerações dentro da mesma casa.',
    posts: [
      {
        slug: 'a-cadeira-da-varanda',
        titulo: 'A cadeira da varanda',
        data: '14 ago 2026',
        resumo: 'Sobre os lugares da casa que guardam memória de quem já não senta mais nela.',
        texto: [
          'Toda casa tem um móvel que ninguém usa e ninguém joga fora. Na casa da minha avó era uma cadeira de vime na varanda, com o assento cedendo no meio. Foi ali que ela contou, durante anos, as mesmas quatro histórias para netos diferentes.',
          'Quando as famílias me procuram para falar de perda, quase sempre aparece um objeto assim. Ele funciona como um lugar de encontro entre o que foi vivido e o que ainda dói. Guardar não é ficar preso; é ter onde chegar quando a saudade aperta.',
          'Meu conselho prático é simples: dê nome ao objeto e conte a história dele em voz alta, para quem for pequeno. Memória que não é narrada se dissolve em uma geração.',
        ],
      },
      {
        slug: 'quando-o-avo-precisa-de-cuidado',
        titulo: 'Quando o avô passa a precisar de cuidado',
        data: '31 jul 2026',
        resumo: 'A inversão de papéis que ninguém ensina e a conversa que é melhor não adiar.',
        texto: [
          'Há um dia em que o carro precisa ficar na garagem, ou em que os remédios passam a ser conferidos por outra pessoa. Esse dia costuma chegar antes da conversa sobre ele, e é aí que a família se desorganiza.',
          'Antecipar é gentileza. Perguntar, com calma e enquanto ainda há autonomia, como aquela pessoa gostaria de ser cuidada evita decisões tomadas na urgência e no ressentimento.',
          'Distribuir tarefas entre os adultos, por escrito, protege quem naturalmente assume tudo — quase sempre uma mulher da família. Cuidado que não é dividido vira adoecimento silencioso.',
        ],
      },
    ],
  },
  {
    slug: 'diario-de-quem-cuida',
    nome: 'Diário de quem cuida',
    colunista: 'Bianca Toledo',
    chamada: 'Relatos honestos sobre a rotina de cuidar sem se perder.',
    periodicidade: 'Semanal',
    sobre: 'Anotações de quem vive a rotina por dentro: cansaço, culpa, pequenas vitórias e o direito de não dar conta de tudo.',
    posts: [
      {
        slug: 'a-culpa-de-nao-dar-conta',
        titulo: 'A culpa de não dar conta',
        data: '18 ago 2026',
        resumo: 'Sobre o padrão impossível que a gente aceitou sem perceber.',
        texto: [
          'Nenhuma geração antes da nossa cuidou de crianças com tão pouca rede e tanta plateia. A comparação é constante e o parâmetro é sempre o melhor dia da vida de outra família.',
          'A pergunta que ajuda não é "estou fazendo o suficiente?", mas "o que dá para sustentar nesta semana?". Cuidado sustentável é o único que continua existindo no mês que vem.',
          'Escolher três prioridades por semana e abandonar o resto, sem drama, é uma prática que recomendo a todas as famílias com quem trabalho.',
        ],
      },
      {
        slug: 'domingo-a-tarde',
        titulo: 'Domingo à tarde',
        data: '11 ago 2026',
        resumo: 'O horário mais difícil da semana e o que fazer com ele.',
        texto: [
          'Existe uma tristeza específica do fim do domingo. Nas casas com crianças, ela costuma virar birra, dor de barriga ou discussão sobre mochila.',
          'Ritualizar essa hora ajuda: uma refeição simples e repetida, uma conversa curta sobre o que vem na semana, algo previsível que sinalize a virada.',
          'Não é preciso resolver a tristeza. Basta não deixá-la sozinha.',
        ],
      },
    ],
  },
  {
    slug: 'consultorio-aberto',
    nome: 'Consultório aberto',
    colunista: 'Dra. Helena Prado',
    chamada: 'Perguntas reais de famílias, respondidas com calma.',
    periodicidade: 'Mensal',
    sobre: 'Cada edição responde perguntas enviadas por responsáveis, sem jargão e sem receita pronta.',
    posts: [
      {
        slug: 'meu-filho-nao-quer-ir-a-escola',
        titulo: '"Meu filho não quer ir à escola"',
        data: '05 ago 2026',
        resumo: 'Como diferenciar resistência passageira de sinal de alerta.',
        texto: [
          'A recusa escolar quase nunca é sobre a escola em si. É sobre algo que acontece lá e que ainda não foi dito: um colega, uma dificuldade de aprendizagem, um professor que assusta, uma separação difícil em casa.',
          'Antes de negociar a ida, investigue com perguntas concretas: com quem brincou, o que foi fácil, o que foi chato, quem senta ao lado. Perguntas amplas recebem respostas vazias.',
          'Se a recusa durar mais de duas semanas ou vier com sintomas físicos, converse com a escola e com um profissional. Quanto mais cedo, menor o estrago no vínculo com o aprender.',
        ],
      },
    ],
  },
];

export function getColuna(slug) {
  return colunas.find((coluna) => coluna.slug === slug);
}
