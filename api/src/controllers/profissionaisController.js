const artigoModel = require('../models/artigoModel');
const colunaModel = require('../models/colunaModel');
const profissionalModel = require('../models/profissionalModel');
const HttpError = require('../utils/HttpError');
const { texto } = require('../utils/validacao');

// GET /api/profissionais?busca=&especialidade=
async function listar(req, res) {
  res.json(await profissionalModel.listar({ busca: texto(req.query.busca), especialidade: texto(req.query.especialidade) }));
}

// GET /api/profissionais/:slug — perfil com os artigos e as colunas da pessoa (ligados pelo nome, como no site)
async function buscar(req, res) {
  const profissional = await profissionalModel.buscarPorSlug(req.params.slug);
  if (!profissional) throw new HttpError(404, 'Perfil não encontrado.');

  const [artigos, colunas] = await Promise.all([
    artigoModel.listar({ autorNome: profissional.nome }),
    colunaModel.listar({ colunistaNome: profissional.nome }),
  ]);
  res.json({ ...profissional, artigos, colunas });
}

module.exports = { listar, buscar };
