const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');
const HttpError = require('../utils/HttpError');
const { emailValido, texto, verificarCampos } = require('../utils/validacao');

// POST /api/auth/login — confere e-mail e senha (hash bcrypt) e devolve os dados do usuário.
// Na Entrega 3 esta rota passa a devolver também o token JWT.
async function login(req, res) {
  const email = texto(req.body?.email).toLowerCase();
  const senha = typeof req.body?.senha === 'string' ? req.body.senha : '';
  verificarCampos({
    email: !emailValido(email) && 'Informe um e-mail válido.',
    senha: !senha && 'Informe a senha.',
  });

  const usuario = await usuarioModel.buscarPorEmailComSenha(email);
  const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senhaHash) : false;
  if (!senhaConfere) throw new HttpError(401, 'E-mail ou senha incorretos.');

  const { senhaHash, ...dados } = usuario;
  res.json({ usuario: dados });
}

module.exports = { login };
