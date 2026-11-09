const artigoModel = require('../models/artigoModel');
const comentarioModel = require('../models/comentarioModel');
const HttpError = require('../utils/HttpError');
const { idDaRota } = require('../utils/validacao');

// Controle de acesso por nível. Estes middlewares vêm sempre depois de "autenticar",
// que confere o token e preenche req.usuario com os dados atuais do banco.

function ehAdmin(usuario) {
  return usuario?.nivel === 'admin';
}

// Mesma regra do site: publica quem é admin ou profissional aprovado pela administração
function podePublicar(usuario) {
  return ehAdmin(usuario) || (usuario?.nivel === 'profissional' && usuario.verificacao === 'aprovado');
}

// Libera a rota só para os níveis informados. Ex.: permitirNiveis('admin')
function permitirNiveis(...niveis) {
  return function verificarNivel(req, res, next) {
    if (!niveis.includes(req.usuario?.nivel)) throw new HttpError(403, 'Você não tem permissão para esta ação.');
    next();
  };
}

// POST /artigos: admin ou profissional aprovado
function exigirPublicador(req, res, next) {
  if (!podePublicar(req.usuario)) {
    throw new HttpError(
      403,
      req.usuario?.nivel === 'profissional'
        ? 'Sua conta profissional ainda não foi aprovada para publicar.'
        : 'Apenas profissionais aprovados e a administração publicam artigos.'
    );
  }
  next();
}

// GET /usuarios/:id e /usuarios/:id/interacoes: a própria pessoa ou admin
function proprioUsuarioOuAdmin(req, res, next) {
  if (!ehAdmin(req.usuario) && req.usuario?.id !== Number(req.params.id)) {
    throw new HttpError(403, 'Você só pode ver os dados da sua própria conta.');
  }
  next();
}

// PUT e DELETE /artigos/:id: admin altera qualquer artigo; o autor, só os próprios
// (e enquanto puder publicar, como no app). Deixa o artigo em req.artigo para o controller.
async function autorDoArtigoOuAdmin(req, res, next) {
  const artigo = await artigoModel.buscarPorId(idDaRota(req.params.id, 'Artigo'));
  if (!artigo) throw new HttpError(404, 'Artigo não encontrado.');

  if (!ehAdmin(req.usuario)) {
    if (artigo.autor.id !== req.usuario.id) {
      throw new HttpError(403, 'Apenas o autor do artigo ou a administração podem alterá-lo.');
    }
    if (!podePublicar(req.usuario)) {
      throw new HttpError(403, 'Sua conta profissional precisa estar aprovada para alterar artigos.');
    }
  }
  req.artigo = artigo;
  next();
}

// DELETE /comentarios/:id: quem escreveu o comentário ou admin (moderação)
async function autorDoComentarioOuAdmin(req, res, next) {
  const comentario = await comentarioModel.buscarPorId(idDaRota(req.params.id, 'Comentário'));
  if (!comentario) throw new HttpError(404, 'Comentário não encontrado.');

  if (!ehAdmin(req.usuario) && comentario.usuarioId !== req.usuario.id) {
    throw new HttpError(403, 'Apenas quem escreveu o comentário ou a administração podem excluí-lo.');
  }
  req.comentario = comentario;
  next();
}

module.exports = {
  ehAdmin,
  podePublicar,
  permitirNiveis,
  exigirPublicador,
  proprioUsuarioOuAdmin,
  autorDoArtigoOuAdmin,
  autorDoComentarioOuAdmin,
};
