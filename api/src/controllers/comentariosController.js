const comentarioModel = require('../models/comentarioModel');
const { texto, verificarCampos } = require('../utils/validacao');
const { buscarOuFalhar } = require('./artigosController');

// GET /api/artigos/:slug/comentarios
async function listar(req, res) {
  const artigo = await buscarOuFalhar(req.params.slug);
  res.json(await comentarioModel.listarPorPublicacao(artigo.slug));
}

// POST /api/artigos/:slug/comentarios — quem comenta é o usuário do token
async function criar(req, res) {
  const artigo = await buscarOuFalhar(req.params.slug);
  const textoComentario = texto(req.body?.texto);
  verificarCampos({
    texto: (textoComentario.length < 3 || textoComentario.length > 1000) && 'O comentário deve ter entre 3 e 1000 caracteres.',
  });
  const comentario = await comentarioModel.criar({ slug: artigo.slug, usuarioId: req.usuario.id, texto: textoComentario });
  res.status(201).json(comentario);
}

// DELETE /api/comentarios/:id — o middleware autorDoComentarioOuAdmin já conferiu quem pode excluir
async function excluir(req, res) {
  await comentarioModel.excluir(req.comentario.id);
  res.status(204).end();
}

module.exports = { listar, criar, excluir };
