// Níveis de usuário, rotas protegidas e CRUD de artigos com controle de permissão (npm test)
const assert = require('node:assert/strict');
const { after, before, describe, test } = require('node:test');
const { apagarContas, artigoValido, db, emailDeTeste, entrar, iniciarApi } = require('./apoio');

describe('Níveis, permissões e CRUD de artigos', () => {
  let api;
  const contasCriadas = [];
  const mensagensCriadas = [];
  const senha = 'senha-forte-123';
  // família e profissional criados pelo teste; admin e Dra. Helena (profissional aprovada) vêm do seed
  const familia = {};
  const profissional = {};
  const admin = {};
  const outraProfissional = {};
  let artigoId;

  async function criarConta(destino, corpo) {
    const { status, dados } = await api.req('POST', '/usuarios', { body: { senha, ...corpo } });
    assert.equal(status, 201);
    contasCriadas.push(dados.usuario.id);
    const login = await entrar(api.req, corpo.email, senha);
    Object.assign(destino, { id: dados.usuario.id, token: login.token });
  }

  before(async () => {
    api = await iniciarApi();
    await criarConta(familia, { nome: 'Família de Teste', email: emailDeTeste('familia'), tipo: 'usuario' });
    await criarConta(profissional, {
      nome: 'Profissional de Teste',
      email: emailDeTeste('profissional'),
      tipo: 'profissional',
      profissao: 'Psicopedagoga',
      registro: 'ABPp 0000',
    });
    const loginAdmin = await entrar(api.req, 'admin@conexaopais.test');
    Object.assign(admin, { id: loginAdmin.usuario.id, token: loginAdmin.token });
    const loginHelena = await entrar(api.req, 'profissional@conexaopais.test');
    Object.assign(outraProfissional, { id: loginHelena.usuario.id, token: loginHelena.token });
  });

  after(async () => {
    if (mensagensCriadas.length) await db.query('DELETE FROM mensagens WHERE id IN (?)', [mensagensCriadas]);
    await apagarContas(contasCriadas);
    await api.encerrar();
  });

  test('visitante lê artigos, mas não publica, comenta nem curte (401)', async () => {
    const lista = await api.req('GET', '/artigos');
    assert.equal(lista.status, 200);
    assert.ok(lista.dados.length > 0);

    const artigoDoSeed = lista.dados[0].id;
    assert.equal((await api.req('GET', `/artigos/${artigoDoSeed}`)).status, 200);
    assert.equal((await api.req('POST', '/artigos', { body: artigoValido })).status, 401);
    assert.equal((await api.req('POST', `/artigos/${artigoDoSeed}/comentarios`, { body: { texto: 'Olá!' } })).status, 401);
    assert.equal((await api.req('POST', `/artigos/${artigoDoSeed}/interacoes`, { body: { tipo: 'curtida' } })).status, 401);
  });

  test('família não publica artigos (403)', async () => {
    const { status } = await api.req('POST', '/artigos', { token: familia.token, body: artigoValido });
    assert.equal(status, 403);
  });

  test('profissional em verificação não publica artigos (403)', async () => {
    const { status, dados } = await api.req('POST', '/artigos', { token: profissional.token, body: artigoValido });
    assert.equal(status, 403);
    assert.match(dados.erro, /aprovada/);
  });

  test('só o admin lista contas e decide cadastros profissionais', async () => {
    assert.equal((await api.req('GET', '/usuarios', { token: familia.token })).status, 403);

    // o próprio profissional não consegue se aprovar
    const autoAprovacao = await api.req('PATCH', `/usuarios/${profissional.id}/verificacao`, {
      token: profissional.token,
      body: { verificacao: 'aprovado' },
    });
    assert.equal(autoAprovacao.status, 403);

    const pendentes = await api.req('GET', '/usuarios?nivel=profissional&verificacao=pendente', { token: admin.token });
    assert.equal(pendentes.status, 200);
    assert.ok(pendentes.dados.some((conta) => conta.id === profissional.id));

    const aprovacao = await api.req('PATCH', `/usuarios/${profissional.id}/verificacao`, {
      token: admin.token,
      body: { verificacao: 'aprovado' },
    });
    assert.equal(aprovacao.status, 200);
    assert.equal(aprovacao.dados.verificacao, 'aprovado');
  });

  test('a aprovação vale sem novo login, e o autor do artigo vem do token', async () => {
    // mesmo token de antes da aprovação; o "autorId" do corpo tenta se passar pelo admin
    const { status, dados } = await api.req('POST', '/artigos', {
      token: profissional.token,
      body: { ...artigoValido, autorId: admin.id },
    });
    assert.equal(status, 201);
    assert.equal(dados.autor.id, profissional.id);
    artigoId = dados.id;
  });

  test('outra profissional e a família não editam nem excluem o artigo (403)', async () => {
    const edicao = await api.req('PUT', `/artigos/${artigoId}`, {
      token: outraProfissional.token,
      body: { ...artigoValido, titulo: 'Título trocado por outra pessoa' },
    });
    assert.equal(edicao.status, 403);
    assert.equal((await api.req('DELETE', `/artigos/${artigoId}`, { token: familia.token })).status, 403);
    assert.equal((await api.req('DELETE', `/artigos/${artigoId}`, { token: outraProfissional.token })).status, 403);
  });

  test('a autora edita o próprio artigo e o admin edita qualquer artigo', async () => {
    const daAutora = await api.req('PUT', `/artigos/${artigoId}`, {
      token: profissional.token,
      body: { ...artigoValido, titulo: 'Título revisado pela autora' },
    });
    assert.equal(daAutora.status, 200);
    assert.equal(daAutora.dados.titulo, 'Título revisado pela autora');

    const doAdmin = await api.req('PUT', `/artigos/${artigoId}`, {
      token: admin.token,
      body: { ...artigoValido, titulo: 'Título revisado pela administração' },
    });
    assert.equal(doAdmin.status, 200);
    assert.equal((await api.req('GET', `/artigos/${artigoId}`)).dados.titulo, 'Título revisado pela administração');
  });

  test('comentário: fica com a conta do token; quem escreveu ou o admin excluem', async () => {
    const primeiro = await api.req('POST', `/artigos/${artigoId}/comentarios`, {
      token: familia.token,
      body: { texto: 'Obrigada pelo texto!', usuarioId: admin.id },
    });
    assert.equal(primeiro.status, 201);
    assert.equal(primeiro.dados.usuarioId, familia.id);

    assert.equal((await api.req('DELETE', `/comentarios/${primeiro.dados.id}`, { token: outraProfissional.token })).status, 403);
    assert.equal((await api.req('DELETE', `/comentarios/${primeiro.dados.id}`, { token: familia.token })).status, 204);

    const segundo = await api.req('POST', `/artigos/${artigoId}/comentarios`, {
      token: familia.token,
      body: { texto: 'Um comentário para a moderação.' },
    });
    assert.equal((await api.req('DELETE', `/comentarios/${segundo.dados.id}`, { token: admin.token })).status, 204);
    assert.equal((await api.req('GET', `/artigos/${artigoId}/comentarios`)).dados.length, 0);
  });

  test('curtir e salvar valem para a conta do token', async () => {
    const curtida = await api.req('POST', `/artigos/${artigoId}/interacoes`, {
      token: familia.token,
      body: { tipo: 'curtida', usuarioId: admin.id },
    });
    assert.equal(curtida.status, 200);
    assert.equal(curtida.dados.ativo, true);
    assert.equal(curtida.dados.total, 1);

    const daFamilia = await api.req('GET', `/usuarios/${familia.id}/interacoes`, { token: familia.token });
    assert.ok(daFamilia.dados.some((item) => item.publicacaoId === artigoId && item.tipo === 'curtida'));
    const doAdmin = await api.req('GET', `/usuarios/${admin.id}/interacoes`, { token: admin.token });
    assert.ok(!doAdmin.dados.some((item) => item.publicacaoId === artigoId));

    const desfeita = await api.req('POST', `/artigos/${artigoId}/interacoes`, { token: familia.token, body: { tipo: 'curtida' } });
    assert.equal(desfeita.dados.ativo, false);
    assert.equal(desfeita.dados.total, 0);
  });

  test('dados da conta: só a própria pessoa ou o admin', async () => {
    assert.equal((await api.req('GET', `/usuarios/${familia.id}`, { token: familia.token })).status, 200);
    assert.equal((await api.req('GET', `/usuarios/${profissional.id}`, { token: familia.token })).status, 403);
    assert.equal((await api.req('GET', `/usuarios/${profissional.id}/interacoes`, { token: familia.token })).status, 403);
    assert.equal((await api.req('GET', `/usuarios/${familia.id}`, { token: admin.token })).status, 200);
  });

  test('mensagens: contato é aberto, pergunta à equipe exige login', async () => {
    const perguntaSemConta = await api.req('POST', '/mensagens', {
      body: { tipo: 'pergunta', nome: 'Visitante', email: 'visitante@exemplo.com', mensagem: 'Uma dúvida sobre sono.' },
    });
    assert.equal(perguntaSemConta.status, 401);

    const contato = await api.req('POST', '/mensagens', {
      body: { tipo: 'contato', nome: 'Visitante', email: 'visitante@exemplo.com', mensagem: 'Sugestão de pauta para a revista.' },
    });
    assert.equal(contato.status, 201);
    mensagensCriadas.push(contato.dados.id);

    const pergunta = await api.req('POST', '/mensagens', {
      token: familia.token,
      body: { tipo: 'pergunta', mensagem: 'Como lidar com a hora de dormir?', usuarioId: admin.id },
    });
    assert.equal(pergunta.status, 201);
    assert.equal(pergunta.dados.nome, 'Família de Teste'); // nome e e-mail vieram da conta
    mensagensCriadas.push(pergunta.dados.id);
    const [[linha]] = await db.query('SELECT usuario_id FROM mensagens WHERE id = ?', [pergunta.dados.id]);
    assert.equal(linha.usuario_id, familia.id);
  });

  test('a autora exclui o próprio artigo e ele deixa de existir', async () => {
    assert.equal((await api.req('DELETE', `/artigos/${artigoId}`, { token: profissional.token })).status, 204);
    assert.equal((await api.req('GET', `/artigos/${artigoId}`)).status, 404);
    assert.equal((await api.req('DELETE', `/artigos/${artigoId}`, { token: profissional.token })).status, 404);
  });

  test('o admin exclui artigo de outra pessoa', async () => {
    const criado = await api.req('POST', '/artigos', { token: profissional.token, body: artigoValido });
    assert.equal((await api.req('DELETE', `/artigos/${criado.dados.id}`, { token: admin.token })).status, 204);
  });

  test('profissional recusado perde a publicação e a edição na hora, com o mesmo token', async () => {
    const criado = await api.req('POST', '/artigos', { token: profissional.token, body: artigoValido });
    assert.equal(criado.status, 201);

    await api.req('PATCH', `/usuarios/${profissional.id}/verificacao`, {
      token: admin.token,
      body: { verificacao: 'recusado' },
    });

    const edicao = await api.req('PUT', `/artigos/${criado.dados.id}`, { token: profissional.token, body: artigoValido });
    assert.equal(edicao.status, 403);
    assert.equal((await api.req('POST', '/artigos', { token: profissional.token, body: artigoValido })).status, 403);
  });
});
