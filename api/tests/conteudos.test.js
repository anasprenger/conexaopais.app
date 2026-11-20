// Conteúdos públicos iguais aos do site: colunas, revista, profissionais e categorias (npm test)
const assert = require('node:assert/strict');
const { after, before, describe, test } = require('node:test');
const { CONTAS, entrar, iniciarApi } = require('./apoio');

describe('Conteúdos iguais aos do site', () => {
  let api;

  before(async () => {
    api = await iniciarApi();
  });

  after(async () => {
    await api.encerrar();
  });

  test('status confere API e banco', async () => {
    const { status, dados } = await api.req('GET', '/status');
    assert.equal(status, 200);
    assert.deepEqual(dados, { api: 'ok', banco: 'ok' });
  });

  test('profissionais: lista do site, com busca sem acentos e perfil com artigos e colunas', async () => {
    const lista = await api.req('GET', '/profissionais');
    assert.equal(lista.dados.length, 4);
    const busca = await api.req('GET', '/profissionais?busca=pediatria');
    assert.deepEqual(busca.dados.map((p) => p.slug), ['rafael-nunes']);

    const helena = await api.req('GET', '/profissionais/helena-prado');
    assert.equal(helena.status, 200);
    assert.ok(helena.dados.artigos.some((artigo) => artigo.slug === 'conversas-dificeis'));
    assert.ok(helena.dados.colunas.some((coluna) => coluna.slug === 'consultorio-aberto'));
    assert.equal((await api.req('GET', '/profissionais/nao-existe')).status, 404);
  });

  test('colunas: as do site e as publicadas no banco, que somem quando escondidas', async () => {
    await api.query(
      `INSERT INTO public.publicacoes (tipo, slug, titulo, resumo, conteudo, autor_id)
       VALUES ('coluna', 'coluna-do-banco', 'Coluna do banco', 'Chamada da coluna', 'Primeiro parágrafo.\n\nSegundo.', $1)`,
      [CONTAS.admin.id]
    );
    const lista = await api.req('GET', '/colunas');
    assert.ok(lista.dados.some((coluna) => coluna.slug === 'entre-geracoes' && coluna.totalPosts === 2));
    assert.ok(lista.dados.some((coluna) => coluna.slug === 'coluna-do-banco' && coluna.colunista.nome === 'Ana (Administração)'));

    const coluna = await api.req('GET', '/colunas/entre-geracoes');
    assert.equal(coluna.dados.posts[0].publicadoEm, '2026-08-14');
    assert.match(coluna.dados.posts[0].texto, /\n\n/);

    await api.query(
      "INSERT INTO public.conteudos_ocultos (tipo, slug, titulo, ocultado_por) VALUES ('coluna', 'entre-geracoes', 'Entre Gerações', $1)",
      [CONTAS.admin.id]
    );
    assert.equal((await api.req('GET', '/colunas/entre-geracoes')).status, 404);
  });

  test('colunas: curtir e salvar cada publicação (sem comentários), pelo slug da publicação', async () => {
    const { posts } = (await api.req('GET', '/colunas/consultorio-aberto')).dados;
    const caminho = `/colunas/consultorio-aberto/posts/${posts[0].slug}/interacoes`;
    assert.equal((await api.req('POST', caminho, { body: { tipo: 'curtida' } })).status, 401);

    const familia = await entrar(api.req, CONTAS.familia.email);
    const salvo = await api.req('POST', caminho, { token: familia.token, body: { tipo: 'salvo' } });
    assert.equal(salvo.status, 200);
    assert.equal(salvo.dados.ativo, true);
    assert.equal(salvo.dados.publicacaoSlug, posts[0].slug);
    const minhas = await api.req('GET', `/usuarios/${familia.usuario.id}/interacoes`, { token: familia.token });
    const daColuna = minhas.dados.find((item) => item.publicacaoSlug === posts[0].slug && item.tipo === 'salvo');
    assert.equal(daColuna.coluna.slug, 'consultorio-aberto');
    assert.equal(daColuna.titulo, posts[0].titulo);

    const errado = '/colunas/consultorio-aberto/posts/nao-existe/interacoes';
    assert.equal((await api.req('POST', errado, { token: familia.token, body: { tipo: 'curtida' } })).status, 404);
    assert.equal((await api.req('POST', caminho, { token: familia.token, body: { tipo: 'comentario' } })).status, 400);
  });

  test('revista: edições do site e as publicadas no banco (com o PDF)', async () => {
    await api.query(
      `INSERT INTO public.publicacoes (tipo, slug, titulo, resumo, pdf_url, autor_id)
       VALUES ('revista', 'revista-do-banco', 'Edição nova', $2, 'https://exemplo.com/edicao.pdf', $1)`,
      [CONTAS.admin.id, 'Resumo da edição.\n- Tema um - Tema dois\n- Tema três']
    );
    const lista = await api.req('GET', '/revistas');
    assert.deepEqual(lista.dados.map((revista) => revista.edicao), [4, 3, 2, 1]);
    assert.equal(lista.dados[0].slug, 'revista-do-banco');
    // como no site: o título vem do campo título e a sinopse não se repete (texto corrido + tópicos)
    assert.equal(lista.dados[0].subtitulo, 'Edição nova');
    assert.equal(lista.dados[0].descricao, 'Resumo da edição.');
    assert.deepEqual(lista.dados[0].destaques, ['Tema um', 'Tema dois', 'Tema três']);
    assert.match(lista.dados[0].sinopse, /^Resumo da edição\.\n- Tema um/);

    const nova = await api.req('GET', '/revistas/revista-do-banco');
    assert.equal(nova.dados.pdfUrl, 'https://exemplo.com/edicao.pdf');
    assert.equal(nova.dados.paginas.length, 1);

    const doSite = await api.req('GET', '/revistas/edicao-03');
    assert.equal(doSite.dados.publicadaEm, '2026-08-01');
    assert.equal(doSite.dados.totalPaginas, 4);
    assert.match(doSite.dados.pdfUrl, /^https:\/\/conexaopais\.com\/revistas\/edicao-03\.pdf$/);
  });

  test('categorias e busca de artigos', async () => {
    const categorias = await api.req('GET', '/categorias');
    assert.ok(categorias.dados.includes('Gerações'));
    const busca = await api.req('GET', '/artigos?busca=geracoes');
    assert.ok(busca.dados.some((artigo) => artigo.slug === 'avos-e-netos'));
    const porCategoria = await api.req('GET', '/artigos?categoria=Educa%C3%A7%C3%A3o');
    assert.ok(porCategoria.dados.every((artigo) => artigo.categoria === 'Educação'));
  });
});
