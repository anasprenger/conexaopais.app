// Recursos que o site ganhou depois da primeira versão do app (npm test):
// página "Usuários" da administração, excluir a própria conta e edição das edições da revista.
const assert = require('node:assert/strict');
const { after, before, describe, test } = require('node:test');
const { emailDeTeste, entrar, iniciarApi } = require('./apoio');

describe('Administração de usuários, exclusão de conta e edição da revista', () => {
  let api;
  const senha = 'senha-forte-123';
  const admin = {};

  async function criarConta(corpo = {}) {
    const email = emailDeTeste(corpo.prefixo ?? 'conta');
    const { status, dados } = await api.req('POST', '/usuarios', {
      body: { nome: 'Conta de Teste', email, senha, tipo: 'usuario', ...corpo },
    });
    assert.equal(status, 201);
    const login = await entrar(api.req, email, senha);
    return { id: dados.usuario.id, email, token: login.token };
  }

  before(async () => {
    api = await iniciarApi();
    const login = await entrar(api.req, 'admin@conexaopais.test');
    Object.assign(admin, { id: login.usuario.id, token: login.token });
  });

  after(async () => {
    await api.encerrar();
  });

  test('a lista de usuários traz os papéis e o último acesso, e só a administração vê', async () => {
    const familia = await criarConta();
    assert.equal((await api.req('GET', '/usuarios', { token: familia.token })).status, 403);

    const { status, dados } = await api.req('GET', '/usuarios', { token: admin.token });
    assert.equal(status, 200);
    const conta = dados.find((usuario) => usuario.id === admin.id);
    assert.ok(conta.papeis.includes('admin'));
    assert.ok('ultimoAcesso' in conta);
  });

  test('o admin libera e retira o papel de profissional; liberado pelo admin já publica', async () => {
    const pessoa = await criarConta();
    const liberar = await api.req('PATCH', `/usuarios/${pessoa.id}/papel`, {
      token: admin.token,
      body: { papel: 'profissional', ativo: true },
    });
    assert.equal(liberar.status, 200);
    assert.equal(liberar.dados.nivel, 'profissional');
    assert.equal(liberar.dados.verificacao, 'aprovado');

    const retirar = await api.req('PATCH', `/usuarios/${pessoa.id}/papel`, {
      token: admin.token,
      body: { papel: 'profissional', ativo: false },
    });
    assert.equal(retirar.dados.nivel, 'usuario');
  });

  test('o admin não tira a própria permissão de administração nem suspende a própria conta', async () => {
    const papel = await api.req('PATCH', `/usuarios/${admin.id}/papel`, {
      token: admin.token,
      body: { papel: 'admin', ativo: false },
    });
    assert.equal(papel.status, 400);
    const suspensao = await api.req('PATCH', `/usuarios/${admin.id}/suspensao`, {
      token: admin.token,
      body: { suspensa: true },
    });
    assert.equal(suspensao.status, 400);
  });

  test('quem não é admin não muda papéis nem suspende contas (403)', async () => {
    const familia = await criarConta();
    const outra = await criarConta();
    const papel = await api.req('PATCH', `/usuarios/${familia.id}/papel`, {
      token: familia.token,
      body: { papel: 'admin', ativo: true },
    });
    assert.equal(papel.status, 403);
    const suspensao = await api.req('PATCH', `/usuarios/${outra.id}/suspensao`, {
      token: familia.token,
      body: { suspensa: true },
    });
    assert.equal(suspensao.status, 403);
  });

  test('conta suspensa perde o acesso na hora e volta ao ser reativada', async () => {
    const pessoa = await criarConta();
    const suspender = await api.req('PATCH', `/usuarios/${pessoa.id}/suspensao`, {
      token: admin.token,
      body: { suspensa: true },
    });
    assert.equal(suspender.status, 200);
    assert.equal(suspender.dados.suspensa, true);
    assert.equal((await api.req('GET', '/auth/perfil', { token: pessoa.token })).status, 401);
    const [perfil] = await api.query('SELECT status FROM public.profiles WHERE id = $1', [pessoa.id]);
    assert.equal(perfil.status, 'suspenso');

    await api.req('PATCH', `/usuarios/${pessoa.id}/suspensao`, { token: admin.token, body: { suspensa: false } });
    assert.equal((await api.req('GET', '/auth/perfil', { token: pessoa.token })).status, 200);
  });

  test('a pessoa exclui a própria conta confirmando com EXCLUIR, e tudo dela some', async () => {
    const pessoa = await criarConta();
    await api.req('POST', '/artigos/conversas-dificeis/comentarios', { token: pessoa.token, body: { texto: 'Comentário de teste' } });

    const semConfirmar = await api.req('DELETE', `/usuarios/${pessoa.id}`, { token: pessoa.token });
    assert.equal(semConfirmar.status, 400);

    const excluir = await api.req('DELETE', `/usuarios/${pessoa.id}`, { token: pessoa.token, body: { confirmacao: 'EXCLUIR' } });
    assert.equal(excluir.status, 204);
    assert.equal((await api.req('GET', '/auth/perfil', { token: pessoa.token })).status, 401);
    const comentarios = await api.query('SELECT count(*)::int AS total FROM public.comentarios WHERE user_id = $1', [pessoa.id]);
    assert.equal(comentarios[0].total, 0);
  });

  test('ninguém exclui a conta de outra pessoa, a não ser a administração', async () => {
    const pessoa = await criarConta();
    const outra = await criarConta();
    const corpo = { confirmacao: 'EXCLUIR' };
    assert.equal((await api.req('DELETE', `/usuarios/${outra.id}`, { token: pessoa.token, body: corpo })).status, 403);
    assert.equal((await api.req('DELETE', `/usuarios/${outra.id}`, { token: admin.token, body: corpo })).status, 204);
  });

  test('a única conta de administração não pode ser excluída', async () => {
    const resposta = await api.req('DELETE', `/usuarios/${admin.id}`, { token: admin.token, body: { confirmacao: 'EXCLUIR' } });
    assert.equal(resposta.status, 400);
  });

  test('o admin edita título e sinopse das edições do banco; as de exemplo não mudam', async () => {
    await api.query(
      `INSERT INTO public.publicacoes (tipo, slug, titulo, resumo, autor_id, status)
       VALUES ('revista', 'edicao-de-teste', 'Edição de teste', 'Sinopse antiga', $1, 'publicado')`,
      [admin.id]
    );
    const familia = await criarConta();
    const corpo = { titulo: 'Edição de teste revista', sinopse: 'Sinopse nova\n- Tópico um\n- Tópico dois' };

    assert.equal((await api.req('PUT', '/revistas/edicao-de-teste', { token: familia.token, body: corpo })).status, 403);

    const editar = await api.req('PUT', '/revistas/edicao-de-teste', { token: admin.token, body: corpo });
    assert.equal(editar.status, 200);
    assert.equal(editar.dados.titulo, corpo.titulo);
    assert.equal(editar.dados.sinopse, corpo.sinopse); // texto completo, para editar de novo
    assert.equal(editar.dados.descricao, 'Sinopse nova');
    assert.deepEqual(editar.dados.destaques, ['Tópico um', 'Tópico dois']);
    assert.equal(editar.dados.slug, 'edicao-de-teste');

    const lista = await api.req('GET', '/revistas');
    const exemplo = lista.dados.find((revista) => revista.id === null);
    const naoEdita = await api.req('PUT', `/revistas/${exemplo.slug}`, { token: admin.token, body: corpo });
    assert.equal(naoEdita.status, 400);
  });
});
