// Cadastro, hash da senha, login, geração e validação do JWT (npm test)
const assert = require('node:assert/strict');
const { after, before, describe, test } = require('node:test');
const jwt = require('jsonwebtoken');
const { emailDeTeste, entrar, iniciarApi } = require('./apoio');

describe('Cadastro, login e JWT', () => {
  let api;
  const email = emailDeTeste('auth');
  const senha = 'senha-forte-123';
  let usuarioId;
  let token;

  before(async () => {
    api = await iniciarApi();
  });

  after(async () => {
    await api.encerrar();
  });

  describe('cadastro (POST /usuarios)', () => {
    test('cria a conta (perfil e nível pelo gatilho do site) e não devolve a senha nem o hash', async () => {
      const { status, dados } = await api.req('POST', '/usuarios', {
        body: { nome: 'Pessoa de Teste', email, senha, tipo: 'usuario' },
      });
      assert.equal(status, 201);
      assert.equal(dados.usuario.email, email);
      assert.equal(dados.usuario.nome, 'Pessoa de Teste');
      assert.equal(dados.usuario.nivel, 'usuario');
      assert.equal(dados.usuario.verificacao, 'aprovado');
      assert.equal(dados.usuario.senha, undefined);
      assert.equal(dados.usuario.encrypted_password, undefined);
      usuarioId = dados.usuario.id;
      assert.match(usuarioId, /^[0-9a-f-]{36}$/);
    });

    test('guarda no banco só o hash bcrypt da senha (auth.users.encrypted_password)', async () => {
      const [linha] = await api.query('SELECT encrypted_password FROM auth.users WHERE id = $1', [usuarioId]);
      assert.notEqual(linha.encrypted_password, senha);
      assert.match(linha.encrypted_password, /^\$2[aby]\$10\$/);
      const [confere] = await api.query('SELECT encrypted_password = crypt($1, encrypted_password) AS ok FROM auth.users WHERE id = $2', [
        senha,
        usuarioId,
      ]);
      assert.equal(confere.ok, true);
    });

    test('conta profissional nasce com nível profissional e verificação pendente', async () => {
      const { status, dados } = await api.req('POST', '/usuarios', {
        body: { nome: 'Profissional Novo', email: emailDeTeste('prof'), senha, tipo: 'profissional', profissao: 'Psicóloga', registro: 'CRP 1234' },
      });
      assert.equal(status, 201);
      assert.equal(dados.usuario.nivel, 'profissional');
      assert.equal(dados.usuario.verificacao, 'pendente');
      assert.equal(dados.usuario.profissao, 'Psicóloga');
      assert.equal(dados.usuario.registroProfissional, 'CRP 1234');
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

    test('credenciais certas devolvem o usuário e um JWT da API com id e nível', async () => {
      const dados = await entrar(api.req, email, senha);
      token = dados.token;
      assert.equal(dados.usuario.id, usuarioId);

      const conteudo = jwt.verify(token, process.env.JWT_SECRET);
      assert.equal(conteudo.sub, usuarioId);
      assert.equal(conteudo.nivel, 'usuario');
      assert.ok(conteudo.exp > Date.now() / 1000, 'o token precisa ter validade');
    });

    test('a conta de administração entra com nível admin (papel mais alto entre os do site)', async () => {
      const { usuario } = await entrar(api.req, 'admin@conexaopais.test');
      assert.equal(usuario.nivel, 'admin');
    });

    test('conta suspensa no site não entra', async () => {
      const suspensa = emailDeTeste('suspensa');
      const criada = await api.req('POST', '/usuarios', { body: { nome: 'Conta Suspensa', email: suspensa, senha, tipo: 'usuario' } });
      await api.query("UPDATE public.profiles SET status = 'suspenso' WHERE id = $1", [criada.dados.usuario.id]);
      const { status } = await api.req('POST', '/auth/login', { body: { email: suspensa, senha } });
      assert.equal(status, 403);
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
      const conteudoFalso = Buffer.from(JSON.stringify({ sub: usuarioId, nivel: 'admin' })).toString('base64url');
      const { status } = await api.req('GET', '/auth/perfil', { token: `${cabecalho}.${conteudoFalso}.${assinatura}` });
      assert.equal(status, 401);
    });

    test('token assinado com outro segredo: 401', async () => {
      const falso = jwt.sign({ nivel: 'admin' }, 'um-segredo-que-a-api-nao-conhece-0123456789', { subject: usuarioId });
      const { status } = await api.req('GET', '/auth/perfil', { token: falso });
      assert.equal(status, 401);
    });

    test('token vencido: 401 com aviso de sessão expirada', async () => {
      const vencido = jwt.sign({ nivel: 'usuario', exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET, {
        subject: usuarioId,
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

    test('o nome do esquema não diferencia maiúsculas ("bearer" também vale)', async () => {
      const { status } = await api.req('GET', '/auth/perfil', { headers: { Authorization: `bearer ${token}` } });
      assert.equal(status, 200);
    });

    test('token de uma conta que não existe mais: 401', async () => {
      const temporaria = await api.req('POST', '/usuarios', {
        body: { nome: 'Conta temporária', email: emailDeTeste('temp'), senha, tipo: 'usuario' },
      });
      const { token: tokenTemporario } = await entrar(api.req, temporaria.dados.usuario.email, senha);
      await api.query('DELETE FROM auth.users WHERE id = $1', [temporaria.dados.usuario.id]);

      const { status } = await api.req('GET', '/auth/perfil', { token: tokenTemporario });
      assert.equal(status, 401);
    });
  });
});
