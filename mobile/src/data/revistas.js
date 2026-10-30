// Edições da revista digital.
// Conteúdo de exemplo trazido do site Conexão Pais (src/data/mock.ts).
// Na Entrega 2 estes dados passam a vir da API (fetch -> Express -> MySQL).

export const revistas = [
  {
    slug: 'edicao-03',
    edicao: 3,
    titulo: 'O tempo que passamos juntos',
    subtitulo: 'Rotina, presença e o que fica das horas em família',
    descricao: 'Uma edição sobre a qualidade do tempo compartilhado: rotinas possíveis, rituais simples e o valor das pequenas conversas.',
    data: 'Agosto de 2026',
    paginas: 4,
    categoria: 'Convivência',
    destaques: [
      'Reportagem: a rotina real de cinco famílias',
      'Entrevista com a Dra. Helena Prado',
      'Ensaio fotográfico: avós e netos',
    ],
    pdf: 'https://conexaopais.com.br/revistas/edicao-03.pdf',
    conteudo: [
      {
        numero: 1,
        secao: 'Capa',
        titulo: 'O tempo que passamos juntos',
        texto: [
          'Edição 03 · Agosto de 2026',
          'Rotina, presença e o que fica das horas em família.',
        ],
      },
      {
        numero: 2,
        secao: 'Carta da edição',
        titulo: 'Presença não se mede em horas',
        texto: [
          'Passamos meses ouvindo famílias falar de tempo: o que falta, o que sobra e o que se perde na pressa.',
          'Esta edição não traz fórmulas de produtividade doméstica. Traz relatos de casas reais e de pequenas escolhas que mudaram o clima do dia.',
        ],
      },
      {
        numero: 3,
        secao: 'Reportagem',
        titulo: 'A rotina real de cinco famílias',
        texto: [
          'Cinco casas abriram a agenda de uma semana inteira para a nossa equipe.',
          'O que se repete não é o horário, e sim a existência de um momento fixo em que todos estão no mesmo lugar — mesmo que por vinte minutos.',
          'Quem tem esse momento relata menos conflito na hora de dormir.',
        ],
      },
      {
        numero: 4,
        secao: 'Entrevista',
        titulo: 'Dra. Helena Prado',
        texto: [
          '"A criança não precisa de um adulto disponível o tempo todo. Precisa de um adulto previsível."',
          'A psicóloga fala sobre vínculo, culpa e o que realmente sustenta a segurança emocional na infância.',
        ],
      },
    ],
  },
  {
    slug: 'edicao-02',
    edicao: 2,
    titulo: 'Escola e casa, mesma direção',
    subtitulo: 'Como construir parceria com quem educa junto',
    descricao: 'Adaptação escolar, reuniões que funcionam e combinados entre família e escola.',
    data: 'Junho de 2026',
    paginas: 3,
    categoria: 'Educação',
    destaques: ['Guia da adaptação', 'O que perguntar na reunião'],
    pdf: 'https://conexaopais.com.br/revistas/edicao-02.pdf',
    conteudo: [
      {
        numero: 1,
        secao: 'Capa',
        titulo: 'Escola e casa, mesma direção',
        texto: ['Edição 02 · Junho de 2026', 'Parceria com quem educa junto.'],
      },
      {
        numero: 2,
        secao: 'Guia',
        titulo: 'A adaptação escolar, dia por dia',
        texto: [
          'Os primeiros quinze dias definem o tom do ano.',
          'Despedidas curtas, previsíveis e sem barganha reduzem a ansiedade de quem fica e de quem vai.',
        ],
      },
      {
        numero: 3,
        secao: 'Prático',
        titulo: 'O que perguntar na reunião',
        texto: [
          'Cinco perguntas que rendem mais do que "como ele está indo?".',
          'Comece por: com quem ele brinca no recreio?',
        ],
      },
    ],
  },
  {
    slug: 'edicao-01',
    edicao: 1,
    titulo: 'Começar por aqui',
    subtitulo: 'A primeira edição do Conexão Pais',
    descricao: 'Nossa carta de intenções: por que existimos e o que queremos construir com as famílias.',
    data: 'Abril de 2026',
    paginas: 3,
    categoria: 'Institucional',
    destaques: ['Manifesto', 'Quem faz o Conexão Pais'],
    pdf: 'https://conexaopais.com.br/revistas/edicao-01.pdf',
    conteudo: [
      {
        numero: 1,
        secao: 'Capa',
        titulo: 'Começar por aqui',
        texto: ['Edição 01 · Abril de 2026', 'Ajudando a unir famílias e gerações.'],
      },
      {
        numero: 2,
        secao: 'Manifesto',
        titulo: 'Por que existimos',
        texto: [
          'Informação sobre criar filhos existe de sobra. O que falta é lugar tranquilo para encontrá-la.',
          'Nosso compromisso é com conteúdo revisado por profissionais e escrito em linguagem de gente.',
        ],
      },
      {
        numero: 3,
        secao: 'Equipe',
        titulo: 'Quem faz o Conexão Pais',
        texto: ['Uma redação pequena e um conselho técnico que revisa cada publicação.'],
      },
    ],
  },
];

export function getRevista(slug) {
  return revistas.find((revista) => revista.slug === slug);
}
