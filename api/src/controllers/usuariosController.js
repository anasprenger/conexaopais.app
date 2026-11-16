const interacaoModel = require('../models/interacaoModel');
const usuarioModel = require('../models/usuarioModel');
const supabaseAuth = require('../services/supabaseAuth');
const HttpError = require('../utils/HttpError');
const { emailValido, idDaRota, texto, verificarCampos } = require('../utils/validacao');

const NIVEIS = ['usuario', 'profissional', 'admin'];
const VERIFICACOES = ['pendente', 'aprovado', 'recusado'];

// POST /api/usuarios — cadastro (família ou profissional), o mesmo cadastro do site.
// A conta é criada no Supabase Auth, que guarda só o hash bcrypt da senha. O gatilho handle_new_user do
// banco cria o perfil e o nível; conta profissional fica "pendente" até a administração aprovar.
async function cadastrar(req, res) {
  const nome = texto(req.body?.nome);
  const email = texto(req.body?.email).toLowerCase();
  const senha = typeof req.body?.senha === 'string' ? req.body.senha : '';
  const tipo = req.body?.tipo ?? 'usuario';
  const profissao = texto(req.body?.profissao);
  const registro = texto(req.body?.registro);
  const isProfissional = tipo === 'profissional';

  verificarCampos({
    nome: (nome.length < 2 || nome.length > 120) && 'Informe como podemos te chamar.',
    email: !emailValido(email) && 'Informe um e-mail válido.',
    senha: senha.length < 6 && 'A senha deve ter pelo menos 6 caracteres.',
    tipo: !['usuario', 'profissional'].includes(tipo) && 'Tipo de conta inválido.',
    profissao: isProfissional && profissao.length < 3 && 'Informe sua profissão.',
    registro: isProfissional && registro.length < 4 && 'Informe o número de cadastro profissional.',
  });

  const { id, confirmarEmail } = await supabaseAuth.cadastrar({ email, senha, nome, tipo, profissao, registro });
  const usuario = await usuarioModel.buscarPorId(id);
  res.status(201).json({ usuario, confirmarEmail });
}

// GET /api/usuarios?nivel=profissional&verificacao=pendente
async function listar(req, res) {
  const { nivel, verificacao } = req.query;
  if (nivel && !NIVEIS.includes(nivel)) throw new HttpError(400, 'Nível inválido.');
  if (verificacao && !VERIFICACOES.includes(verificacao)) throw new HttpError(400, 'Situação de verificação inválida.');
  res.json(await usuarioModel.listar({ nivel, verificacao }));
}

// GET /api/usuarios/:id
async function buscar(req, res) {
  const usuario = await usuarioModel.buscarPorId(idDaRota(req.params.id, 'Usuário'));
  if (!usuario) throw new HttpError(404, 'Usuário não encontrado.');
  res.json(usuario);
}

// GET /api/usuarios/:id/interacoes — curtidas e salvos do usuário
async function listarInteracoes(req, res) {
  const id = idDaRota(req.params.id, 'Usuário');
  if (!(await usuarioModel.buscarPorId(id))) throw new HttpError(404, 'Usuário não encontrado.');
  res.json(await interacaoModel.listarPorUsuario(id));
}

// PATCH /api/usuarios/:id/verificacao — decisão da administração sobre um cadastro profissional
// (a mesma do painel "Novos profissionais" do site: aprovar ou recusar)
async function atualizarVerificacao(req, res) {
  const id = idDaRota(req.params.id, 'Usuário');
  const verificacao = req.body?.verificacao;
  verificarCampos({ verificacao: !VERIFICACOES.includes(verificacao) && 'Use "aprovado", "recusado" ou "pendente".' });

  const usuario = await usuarioModel.buscarPorId(id);
  if (!usuario) throw new HttpError(404, 'Usuário não encontrado.');
  if (usuario.nivel !== 'profissional') throw new HttpError(400, 'Apenas cadastros profissionais passam por verificação.');

  res.json(await usuarioModel.atualizarVerificacao({ id, verificacao, adminId: req.usuario.id }));
}

module.exports = { cadastrar, listar, buscar, listarInteracoes, atualizarVerificacao };
