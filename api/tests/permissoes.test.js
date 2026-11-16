// Níveis de usuário, rotas protegidas e CRUD de artigos com controle de permissão (npm test)
const assert = require('node:assert/strict');
const { after, before, describe, test } = require('node:test');
const { artigoValido, emailDeTeste, entrar, iniciarApi } = require('./apoio');

describe('Níveis, permissões e CRUD de artigos', () => {
  let api;
  const senha = 'senha-forte-123';
  // família e profissional criados pelo teste; admin e Dra. Helena (profissional aprovada) vêm das contas de teste
  const familia = {};
  const profissional = {};
  const admin = {};
  const outraProfissional = {};
  let slug;

  async function criarConta(destino, corpo) {
    const { status, dados } = await api.req('POST', '/usuarios', { body: { senha, ...corpo } });
    assert.equal(status, 201);
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
    await api.encerrar();
  });

  test('visitante lê artigos (incluindo os de exemplo do site), mas não publica, comenta nem curte (401)', async () => {
    const lista = await api.req('GET', '/artigos');
    assert.equal(lista.status, 200);
    assert.ok(lista.dados.some((artigo) => artigo.slug === 'conversas-dificeis' && artigo.exemplo));

    assert.equal((await api.req('GET', '/artigos/conversas-dificeis')).status, 200);
    assert.equal((await api.req('POST', '/artigos', { body: artigoValido })).status, 401);
    assert.equal((await api.req('POST', '/artigos/conversas-dificeis/comentarios', { body: { texto: 'Olá!' } })).status, 401);
    assert.equal((await api.req('POST', '/artigos/conversas-dificeis/interacoes', { body: { tipo: 'curtida' } })).status, 401);
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
    assert.ok(pendentes.dados.every((conta) => conta.nivel === 'profissional' && conta.verificacao === 'pendente'));

    const aprovacao = await api.req('PATCH', `/usuarios/${profissional.id}/verificacao`, {
      token: admin.token,
      body: { verificacao: 'aprovado' },
    });
    assert.equal(aprovacao.status, 200);
    assert.equal(aprovacao.dados.verificacao, 'aprovado');

    // o banco registra quem aprovou, como no painel do site
    const [perfil] = await api.query('SELECT verificado_por FROM public.profiles WHERE id = $1', [profissional.id]);
    assert.equal(perfil.verificado_por, admin.id);
  });

  test('a aprovação vale sem novo login, e o autor do artigo vem do token', async () => {
    // mesmo token de antes da aprovação; o "autorId" do corpo tenta se passar pelo admin
    const { status, dados } = await api.req('POST', '/artigos', {
      token: profissional.token,
      body: { ...artigoValido, autorId: admin.id },
    });
    assert.equal(status, 201);
    assert.equal(dados.autor.id, profissional.id);
    assert.equal(dados.exemplo, false);
    assert.match(dados.slug, /^artigo-criado-pelos-testes-[a-z0-9]+$/);
    slug = dados.slug;

    // gravado na tabela de publicações do site, e aparece na lista
    const [linha] = await api.query('SELECT tipo, status, autor_id FROM public.publicacoes WHERE slug = $1', [slug]);
    assert.deepEqual(linha, { tipo: 'artigo', status: 'publicado', autor_id: profissional.id });
    assert.ok((await api.req('GET', '/artigos')).dados.some((artigo) => artigo.slug === slug));
  });

  test('outra profissional e a família não editam nem excluem o artigo (403)', async () => {
    const edicao = await api.req('PUT', `/artigos/${slug}`, {
      token: outraProfissional.token,
      body: { ...artigoValido, titulo: 'Título trocado por outra pessoa' },
    });
    assert.equal(edicao.status, 403);
    assert.equal((await api.req('DELETE', `/artigos/${slug}`, { token: familia.token })).status, 403);
    assert.equal((await api.req('DELETE', `/artigos/${slug}`, { token: outraProfissional.token })).status, 403);
  });

  test('a autora edita o próprio artigo e o admin edita qualquer artigo', async () => {
    const daAutora = await api.req('PUT', `/artigos/${slug}`, {
      token: profissional.token,
      body: { ...artigoValido, titulo: 'Título revisado pela autora' },
    });
    assert.equal(daAutora.status, 200);
    assert.equal(daAutora.dados.titulo, 'Título revisado pela autora');
    assert.equal(daAutora.dados.slug, slug, 'o slug não muda ao editar');

    const doAdmin = await api.req('PUT', `/artigos/${slug}`, {
      token: admin.token,
      body: { ...artigoValido, titulo: 'Título revisado pela administração' },
    });
    assert.equal(doAdmin.status, 200);
    assert.equal((await api.req('GET', `/artigos/${slug}`)).dados.titulo, 'Título revisado pela administração');
  });

  test('artigo de exemplo do site não é editado; o admin pode escondê-lo', async () => {
    const edicao = await api.req('PUT', '/artigos/telas-sem-culpa', { token: admin.token, body: artigoValido });
    assert.equal(edicao.status, 400);
    assert.equal((await api.req('DELETE', '/artigos/telas-sem-culpa', { token: outraProfissional.token })).status, 403);

    assert.equal((await api.req('DELETE', '/artigos/telas-sem-culpa', { token: admin.token })).status, 204);
    assert.equal((await api.req('GET', '/artigos/telas-sem-culpa')).status, 404);
    assert.ok(!(await api.req('GET', '/artigos')).dados.some((artigo) => artigo.slug === 'telas-sem-culpa'));
    // fica registrado em conteudos_ocultos: o site também deixa de mostrar
    const [oculto] = await api.query("SELECT tipo, ocultado_por FROM public.conteudos_ocultos WHERE slug = 'telas-sem-culpa'");
    assert.deepEqual(oculto, { tipo: 'artigo', ocultado_por: admin.id });
  });

  test('comentário: fica com a conta do token; quem escreveu ou o admin excluem', async () => {
    const primeiro = await api.req('POST', `/artigos/${slug}/comentarios`, {
      token: familia.token,
      body: { texto: 'Obrigada pelo texto!', usuarioId: admin.id },
    });
    assert.equal(primeiro.status, 201);
    assert.equal(primeiro.dados.usuarioId, familia.id);
    assert.equal(primeiro.dados.autorNome, 'Família de Teste');

    assert.equal((await api.req('DELETE', `/comentarios/${primeiro.dados.id}`, { token: outraProfissional.token })).status, 403);
    assert.equal((await api.req('DELETE', `/comentarios/${primeiro.dados.id}`, { token: familia.token })).status, 204);

    const segundo = await api.req('POST', `/artigos/${slug}/comentarios`, {
      token: familia.token,
      body: { texto: 'Um comentário para a moderação.' },
    });
    assert.equal((await api.req('DELETE', `/comentarios/${segundo.dados.id}`, { token: admin.token })).status, 204);
    assert.equal((await api.req('GET', `/artigos/${slug}/comentarios`)).dados.length, 0);
  });

  test('curtir e salvar valem para a conta do token, também nos artigos de exemplo', async () => {
    const curtida = await api.req('POST', '/artigos/conversas-dificeis/interacoes', {
      token: familia.token,
      body: { tipo: 'curtida', usuarioId: admin.id },
    });
    assert.equal(curtida.status, 200);
    assert.equal(curtida.dados.ativo, true);
    assert.equal(curtida.dados.total, 1);

    // gravada pelo slug, como faz o site
    const [linha] = await api.query("SELECT user_id FROM public.interacoes WHERE publicacao_slug = 'conversas-dificeis'");
    assert.equal(linha.user_id, familia.id);
    assert.equal((await api.req('GET', '/artigos/conversas-dificeis')).dados.totais.curtidas, 1);

    const daFamilia = await api.req('GET', `/usuarios/${familia.id}/interacoes`, { token: familia.token });
    assert.ok(daFamilia.dados.some((item) => item.publicacaoSlug === 'conversas-dificeis' && item.tipo === 'curtida'));
    const doAdmin = await api.req('GET', `/usuarios/${admin.id}/interacoes`, { token: admin.token });
    assert.ok(!doAdmin.dados.some((item) => item.publicacaoSlug === 'conversas-dificeis'));

    const desfeita = await api.req('POST', '/artigos/conversas-dificeis/interacoes', { token: familia.token, body: { tipo: 'curtida' } });
    assert.equal(desfeita.dados.ativo, false);
    assert.equal(desfeita.dados.total, 0);
  });

  test('dados da conta: só a própria pessoa ou o admin', async () => {
    assert.equal((await api.req('GET', `/usuarios/${familia.id}`, { token: familia.token })).status, 200);
    assert.equal((await api.req('GET', `/usuarios/${profissional.id}`, { token: familia.token })).status, 403);
    assert.equal((await api.req('GET', `/usuarios/${profissional.id}/interacoes`, { token: familia.token })).status, 403);
    assert.equal((await api.req('GET', `/usuarios/${familia.id}`, { token: admin.token })).status, 200);
  });

  test('mensagens: contato é aberto, pergunta à equipe exige login; as duas vão para o contato do site', async () => {
    const perguntaSemConta = await api.req('POST', '/mensagens', {
      body: { tipo: 'pergunta', nome: 'Visitante', email: 'visitante@exemplo.com', mensagem: 'Uma dúvida sobre sono.' },
    });
    assert.equal(perguntaSemConta.status, 401);

    const contato = await api.req('POST', '/mensagens', {
      body: { tipo: 'contato', nome: 'Visitante', email: 'visitante@exemplo.com', mensagem: 'Sugestão de pauta para a revista.' },
    });
    assert.equal(contato.status, 201);

    const pergunta = await api.req('POST', '/mensagens', {
      token: familia.token,
      body: { tipo: 'pergunta', mensagem: 'Como lidar com a hora de dormir?' },
    });
    assert.equal(pergunta.status, 201);
    assert.equal(pergunta.dados.nome, 'Família de Teste'); // nome e e-mail vieram da conta
    assert.match(pergunta.dados.assunto, /^Pergunta à equipe/);

    const [{ total }] = await api.query('SELECT count(*)::int AS total FROM public.contact_messages');
    assert.equal(total, 2);
  });

  test('mensagens: o limite do site (3 por hora por e-mail) vale no app', async () => {
    const corpo = { tipo: 'contato', nome: 'Pessoa Insistente', email: 'insistente@exemplo.com', mensagem: 'Mensagem repetida de teste.' };
    for (let i = 0; i < 3; i += 1) assert.equal((await api.req('POST', '/mensagens', { body: corpo })).status, 201);
    const quarta = await api.req('POST', '/mensagens', { body: corpo });
    assert.equal(quarta.status, 429);
  });

  test('a autora exclui o próprio artigo e ele deixa de existir', async () => {
    assert.equal((await api.req('DELETE', `/artigos/${slug}`, { token: profissional.token })).status, 204);
    assert.equal((await api.req('GET', `/artigos/${slug}`)).status, 404);
    assert.equal((await api.req('DELETE', `/artigos/${slug}`, { token: profissional.token })).status, 404);
  });

  test('o admin exclui artigo de outra pessoa e o motivo fica registrado para o autor', async () => {
    const criado = await api.req('POST', '/artigos', { token: profissional.token, body: artigoValido });
    const exclusao = await api.req('DELETE', `/artigos/${criado.dados.slug}`, {
      token: admin.token,
      body: { justificativa: 'Conteúdo fora do tema da plataforma.' },
    });
    assert.equal(exclusao.status, 204);
    const [aviso] = await api.query('SELECT autor_id, removido_por, justificativa FROM public.remocoes_publicacao WHERE slug = $1', [
      criado.dados.slug,
    ]);
    assert.deepEqual(aviso, { autor_id: profissional.id, removido_por: admin.id, justificativa: 'Conteúdo fora do tema da plataforma.' });
  });

  test('profissional recusado perde a publicação e a edição na hora, com o mesmo token', async () => {
    const criado = await api.req('POST', '/artigos', { token: profissional.token, body: artigoValido });
    assert.equal(criado.status, 201);

    await api.req('PATCH', `/usuarios/${profissional.id}/verificacao`, {
      token: admin.token,
      body: { verificacao: 'recusado' },
    });

    const edicao = await api.req('PUT', `/artigos/${criado.dados.slug}`, { token: profissional.token, body: artigoValido });
    assert.equal(edicao.status, 403);
    assert.equal((await api.req('POST', '/artigos', { token: profissional.token, body: artigoValido })).status, 403);
  });
});
