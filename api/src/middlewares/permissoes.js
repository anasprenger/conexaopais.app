const HttpError = require('../utils/HttpError');

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

module.exports = { ehAdmin, podePublicar, permitirNiveis, exigirPublicador, proprioUsuarioOuAdmin };
