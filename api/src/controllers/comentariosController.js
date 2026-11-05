const comentarioModel = require('../models/comentarioModel');
const usuarioModel = require('../models/usuarioModel');
const HttpError = require('../utils/HttpError');
const { idDaRota, texto, verificarCampos } = require('../utils/validacao');
const { buscarOuFalhar } = require('./artigosController');

// GET /api/artigos/:id/comentarios
async function listar(req, res) {
  const artigo = await buscarOuFalhar(req.params.id);
  res.json(await comentarioModel.listarPorPublicacao(artigo.id));
}

// POST /api/artigos/:id/comentarios — Entrega 2: usuarioId no corpo; Entrega 3: vem do token
async function criar(req, res) {
  const artigo = await buscarOuFalhar(req.params.id);
  const textoComentario = texto(req.body?.texto);
  verificarCampos({
    texto: (textoComentario.length < 3 || textoComentario.length > 1000) && 'O comentário deve ter entre 3 e 1000 caracteres.',
  });
  const usuario = await usuarioModel.buscarPorId(Number(req.body?.usuarioId) || 0);
  if (!usuario) throw new HttpError(400, 'Usuário não encontrado.');

  const comentario = await comentarioModel.criar({ publicacaoId: artigo.id, usuarioId: usuario.id, texto: textoComentario });
  res.status(201).json(comentario);
}

// DELETE /api/comentarios/:id
async function excluir(req, res) {
  const removido = await comentarioModel.excluir(idDaRota(req.params.id, 'Comentário'));
  if (!removido) throw new HttpError(404, 'Comentário não encontrado.');
  res.status(204).end();
}

module.exports = { listar, criar, excluir };
