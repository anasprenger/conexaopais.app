// Diretório de profissionais parceiros.
// Conteúdo de exemplo trazido do site Conexão Pais (src/data/mock.ts).
// Na Entrega 2 estes dados passam a vir da API (fetch -> Express -> MySQL).

export const profissionais = [
  {
    slug: 'helena-prado',
    nome: 'Dra. Helena Prado',
    especialidade: 'Psicologia infantil',
    descricao: 'Atende famílias há 15 anos, com foco em vínculo e regulação emocional.',
    iniciais: 'HP',
    whatsapp: '5551999990001',
    cidade: 'Porto Alegre, RS',
    atendimento: 'Presencial e online',
  },
  {
    slug: 'rafael-nunes',
    nome: 'Dr. Rafael Nunes',
    especialidade: 'Pediatria',
    descricao: 'Sono, alimentação e desenvolvimento na primeira infância.',
    iniciais: 'RN',
    whatsapp: '5551999990002',
    cidade: 'Curitiba, PR',
    atendimento: 'Presencial',
  },
  {
    slug: 'bianca-toledo',
    nome: 'Bianca Toledo',
    especialidade: 'Pedagogia',
    descricao: 'Alfabetização, adaptação escolar e parceria entre escola e família.',
    iniciais: 'BT',
    whatsapp: '5551999990003',
    cidade: 'São Paulo, SP',
    atendimento: 'Online',
  },
  {
    slug: 'marcos-vilela',
    nome: 'Marcos Vilela',
    especialidade: 'Terapia familiar',
    descricao: 'Mediação de conflitos e cuidado com idosos na dinâmica familiar.',
    iniciais: 'MV',
    whatsapp: '5551999990004',
    cidade: 'Belo Horizonte, MG',
    atendimento: 'Presencial e online',
  },
];

export function getProfissional(slug) {
  return profissionais.find((profissional) => profissional.slug === slug);
}

export function getProfissionalPorNome(nome) {
  return profissionais.find((profissional) => profissional.nome === nome);
}
