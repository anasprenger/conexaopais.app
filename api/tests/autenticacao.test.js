// Cadastro, hash da senha, login, geração e validação do JWT (npm test)
const assert = require('node:assert/strict');
const { after, before, describe, test } = require('node:test');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { apagarContas, db, emailDeTeste, entrar, iniciarApi } = require('./apoio');

describe('Cadastro, login e JWT', () => {
  let api;
  const contasCriadas = [];
  const email = emailDeTeste('auth');
  const senha = 'senha-forte-123';
  let usuarioId;
  let token;

  before(async () => {
    api = await iniciarApi();
  });

  after(async () => {
    await apagarContas(contasCriadas);
    await api.encerrar();
  });

  describe('cadastro (POST /usuarios)', () => {
    test('cria a conta e não devolve a senha nem o hash', async () => {
      const { status, dados } = await api.req('POST', '/usuarios', {
        body: { nome: 'Pessoa de Teste', email, senha, tipo: 'usuario' },
      });
      assert.equal(status, 201);
      assert.equal(dados.usuario.email, email);
      assert.equal(dados.usuario.nivel, 'usuario');
      assert.equal(dados.usuario.senha, undefined);
      assert.equal(dados.usuario.senhaHash, undefined);
      usuarioId = dados.usuario.id;
      contasCriadas.push(usuarioId);
    });

    test('guarda no banco só o hash bcrypt da senha', async () => {
      const [[linha]] = await db.query('SELECT senha_hash FROM usuarios WHERE id = ?', [usuarioId]);
      assert.notEqual(linha.senha_hash, senha);
      assert.match(linha.senha_hash, /^\$2[aby]\$10\$/);
      assert.ok(await bcrypt.compare(senha, linha.senha_hash));
    });

    test('recusa e-mail repetido (409) e dados inválidos (400)', async () => {
      const repetido = await api.req('POST', '/usuarios', { body: { nome: 'Outra', email, senha, tipo: 'usuario' } });
      assert.equal(repetido.status, 409);

      const invalido = await api.req('POST', '/usuarios', { body: { nome: 'A', email: 'sem-arroba', senha: '123' } });
      assert.equal(invalido.status, 400);
      assert.ok(invalido.dados.campos.email);
      assert.ok(invalido.dados.campos.senha);
    });

    test('ninguém se cadastra como admin', async () => {
      const { status } = await api.req('POST', '/usuarios', {
        body: { nome: 'Quer ser admin', email: emailDeTeste('admin'), senha, tipo: 'admin' },
      });
      assert.equal(status, 400);
    });
  });

  describe('login (POST /auth/login)', () => {
    test('senha errada e e-mail inexistente recebem 401 com a mesma mensagem', async () => {
      const senhaErrada = await api.req('POST', '/auth/login', { body: { email, senha: 'errada' } });
      const semConta = await api.req('POST', '/auth/login', { body: { email: emailDeTeste('ninguem'), senha } });
      assert.equal(senhaErrada.status, 401);
      assert.equal(semConta.status, 401);
      assert.equal(senhaErrada.dados.erro, semConta.dados.erro);
      assert.equal(senhaErrada.dados.token, undefined);
    });

    test('credenciais certas devolvem o usuário e um JWT com id e nível', async () => {
      const dados = await entrar(api.req, email, senha);
      token = dados.token;
      assert.equal(dados.usuario.id, usuarioId);
      assert.equal(dados.usuario.senhaHash, undefined);

      const conteudo = jwt.verify(token, process.env.JWT_SECRET);
      assert.equal(conteudo.sub, String(usuarioId));
      assert.equal(conteudo.nivel, 'usuario');
      assert.ok(conteudo.exp > Date.now() / 1000, 'o token precisa ter validade');
    });
  });

  describe('validação do token (GET /auth/perfil)', () => {
    test('sem token: 401', async () => {
      const { status } = await api.req('GET', '/auth/perfil');
      assert.equal(status, 401);
    });

    test('token fora do formato Bearer: 401', async () => {
      const { status } = await api.req('GET', '/auth/perfil', { headers: { Authorization: `Token ${token}` } });
      assert.equal(status, 401);
    });

    test('token adulterado (nível trocado para admin): 401', async () => {
      const [cabecalho, , assinatura] = token.split('.');
      const conteudoFalso = Buffer.from(JSON.stringify({ sub: String(usuarioId), nivel: 'admin' })).toString('base64url');
      const { status } = await api.req('GET', '/auth/perfil', { token: `${cabecalho}.${conteudoFalso}.${assinatura}` });
      assert.equal(status, 401);
    });

    test('token assinado com outro segredo: 401', async () => {
      const falso = jwt.sign({ nivel: 'admin' }, 'um-segredo-que-a-api-nao-conhece-0123456789', { subject: '1' });
      const { status } = await api.req('GET', '/auth/perfil', { token: falso });
      assert.equal(status, 401);
    });

    test('token vencido: 401 com aviso de sessão expirada', async () => {
      const vencido = jwt.sign({ nivel: 'usuario', exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET, {
        subject: String(usuarioId),
      });
      const { status, dados } = await api.req('GET', '/auth/perfil', { token: vencido });
      assert.equal(status, 401);
      assert.match(dados.erro, /expirou/);
    });

    test('token válido: 200 com os dados de quem está logado', async () => {
      const { status, dados } = await api.req('GET', '/auth/perfil', { token });
      assert.equal(status, 200);
      assert.equal(dados.id, usuarioId);
      assert.equal(dados.email, email);
    });

    test('token de uma conta que não existe mais: 401', async () => {
      const temporaria = await api.req('POST', '/usuarios', {
        body: { nome: 'Conta temporária', email: emailDeTeste('temp'), senha, tipo: 'usuario' },
      });
      const { token: tokenTemporario } = await entrar(api.req, temporaria.dados.usuario.email, senha);
      await apagarContas([temporaria.dados.usuario.id]);

      const { status } = await api.req('GET', '/auth/perfil', { token: tokenTemporario });
      assert.equal(status, 401);
    });
  });
});
