const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');
const HttpError = require('../utils/HttpError');
const { gerarToken } = require('../utils/token');
const { emailValido, texto, verificarCampos } = require('../utils/validacao');

// Hash de uma senha qualquer, usado quando o e-mail não existe: a comparação leva o mesmo tempo
// nos dois casos, e quem tenta adivinhar não descobre quais e-mails têm conta pela demora da resposta.
const HASH_SEM_CONTA = bcrypt.hashSync('conta-inexistente', 10);

// POST /api/auth/login — confere e-mail e senha (hash bcrypt) e devolve o token JWT e os dados do usuário.
// O app guarda o token e o envia nas próximas requisições no cabeçalho "Authorization: Bearer <token>".
async function login(req, res) {
  const email = texto(req.body?.email).toLowerCase();
  const senha = typeof req.body?.senha === 'string' ? req.body.senha : '';
  verificarCampos({
    email: !emailValido(email) && 'Informe um e-mail válido.',
    senha: !senha && 'Informe a senha.',
  });

  const usuario = await usuarioModel.buscarPorEmailComSenha(email);
  const senhaConfere = await bcrypt.compare(senha, usuario?.senhaHash ?? HASH_SEM_CONTA);
  if (!usuario || !senhaConfere) throw new HttpError(401, 'E-mail ou senha incorretos.');

  const { senhaHash, ...dados } = usuario;
  res.json({ token: gerarToken(dados), usuario: dados });
}

module.exports = { login };
