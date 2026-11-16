const conteudoSite = require('../data/conteudoSite');
const { normalizar } = require('../utils/texto');

// Diretório de profissionais: no site, os perfis públicos ficam no próprio código (data/conteudoSite.js),
// então o app mostra a mesma lista. Os artigos e colunas de cada perfil são ligados pelo nome do autor.

function formatar({ iniciais, ...profissional }) {
  return profissional;
}

async function listar({ busca, especialidade } = {}) {
  const termo = normalizar(busca);
  return conteudoSite.profissionais
    .filter((profissional) => !especialidade || profissional.especialidade === especialidade)
    .filter(
      (profissional) =>
        !termo ||
        [profissional.nome, profissional.especialidade, profissional.descricao].some((campo) => normalizar(campo).includes(termo))
    )
    .map(formatar);
}

async function buscarPorSlug(slug) {
  const profissional = conteudoSite.profissionais.find((item) => item.slug === slug);
  return profissional ? formatar(profissional) : null;
}

module.exports = { listar, buscarPorSlug };
