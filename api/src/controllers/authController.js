const usuarioModel = require('../models/usuarioModel');
const supabaseAuth = require('../services/supabaseAuth');
const HttpError = require('../utils/HttpError');
const { gerarToken } = require('../utils/token');
const { emailValido, texto, verificarCampos } = require('../utils/validacao');

// POST /api/auth/login — confere e-mail e senha e devolve o token JWT e os dados do usuário.
// 1. o Supabase Auth confere a senha com o hash bcrypt guardado (a conta é a mesma do site);
// 2. a API lê no banco o nível e a situação da conta;
// 3. a API gera o próprio token JWT, assinado com o JWT_SECRET.
// O app guarda o token e o envia nas próximas requisições no cabeçalho "Authorization: Bearer <token>".
async function login(req, res) {
  const email = texto(req.body?.email).toLowerCase();
  const senha = typeof req.body?.senha === 'string' ? req.body.senha : '';
  verificarCampos({
    email: !emailValido(email) && 'Informe um e-mail válido.',
    senha: !senha && 'Informe a senha.',
  });

  const { id } = await supabaseAuth.entrar(email, senha);
  const usuario = await usuarioModel.buscarPorId(id);
  if (!usuario) throw new HttpError(401, 'E-mail ou senha incorretos.');
  if (usuario.suspensa) throw new HttpError(403, 'Esta conta está suspensa. Fale com a administração pela página Contato.');

  res.json({ token: gerarToken(usuario), usuario });
}

// GET /api/auth/perfil — dados de quem está logado (o middleware autenticar já conferiu o token).
// O app usa ao abrir, para saber se o token guardado ainda vale, e para atualizar nível e situação do cadastro.
function perfil(req, res) {
  res.json(req.usuario);
}

module.exports = { login, perfil };
