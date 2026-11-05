const artigoModel = require('../models/artigoModel');
const colunaModel = require('../models/colunaModel');
const profissionalModel = require('../models/profissionalModel');
const HttpError = require('../utils/HttpError');
const { texto } = require('../utils/validacao');

// GET /api/profissionais?busca=&especialidade=
async function listar(req, res) {
  res.json(await profissionalModel.listar({ busca: texto(req.query.busca), especialidade: texto(req.query.especialidade) }));
}

// GET /api/profissionais/:slug — perfil com artigos e colunas da pessoa
async function buscar(req, res) {
  const profissional = await profissionalModel.buscarPorSlug(req.params.slug);
  if (!profissional) throw new HttpError(404, 'Perfil não encontrado.');

  const [artigos, colunas] = profissional.usuarioId
    ? await Promise.all([
        artigoModel.listar({ autorId: profissional.usuarioId }),
        colunaModel.listar({ colunistaId: profissional.usuarioId }),
      ])
    : [[], []];
  res.json({ ...profissional, artigos, colunas });
}

module.exports = { listar, buscar };
