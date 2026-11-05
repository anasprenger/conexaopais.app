import { dataCurta, paragrafos } from '../utils/text';

// Convertem as respostas da API para o formato usado pelas telas

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// "2026-08-14" (coluna DATE) -> Date no fuso local, sem trocar o dia
function dataDoBanco(valor) {
  const [ano, mes, dia] = valor.slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function usuarioDaApi(usuario) {
  return {
    id: usuario.id,
    name: usuario.nome,
    email: usuario.email,
    role: usuario.nivel,
    profissao: usuario.profissao,
    registro: usuario.registroProfissional,
    verificacao: usuario.verificacao,
    observacao: usuario.observacaoAdmin,
  };
}

export function artigoDaApi(artigo) {
  return {
    id: artigo.id,
    slug: artigo.slug,
    titulo: artigo.titulo,
    resumo: artigo.resumo,
    categoria: artigo.categoria,
    tags: artigo.tags,
    destaque: artigo.destaque,
    autor: artigo.autor.nome,
    autorId: artigo.autor.id,
    autorSlug: artigo.autor.slug,
    data: dataCurta(new Date(artigo.criadoEm)),
    leitura: `${artigo.leituraMin} min`,
    curtidas: artigo.totais.curtidas,
    salvos: artigo.totais.salvos,
    comentarios: artigo.totais.comentarios,
    ...(artigo.conteudo !== undefined && { conteudo: paragrafos(artigo.conteudo), texto: artigo.conteudo }),
  };
}

export function comentarioDaApi(comentario) {
  return {
    id: comentario.id,
    usuarioId: comentario.usuarioId,
    autor: comentario.autorNome,
    texto: comentario.texto,
    data: dataCurta(new Date(comentario.criadoEm)),
  };
}

export function colunaDaApi(coluna) {
  return {
    slug: coluna.slug,
    nome: coluna.nome,
    chamada: coluna.chamada,
    periodicidade: coluna.periodicidade,
    sobre: coluna.sobre,
    colunista: coluna.colunista.nome,
    colunistaSlug: coluna.colunista.slug,
    totalPosts: coluna.totalPosts,
    posts: (coluna.posts ?? []).map((post) => ({
      slug: post.slug,
      titulo: post.titulo,
      resumo: post.resumo,
      data: dataCurta(dataDoBanco(post.publicadoEm)),
      texto: paragrafos(post.texto),
    })),
  };
}

export function revistaDaApi(revista) {
  const publicada = dataDoBanco(revista.publicadaEm);
  return {
    slug: revista.slug,
    edicao: revista.edicao,
    titulo: revista.titulo,
    subtitulo: revista.subtitulo,
    descricao: revista.descricao,
    categoria: revista.categoria,
    destaques: revista.destaques,
    pdf: revista.pdfUrl,
    data: `${meses[publicada.getMonth()]} de ${publicada.getFullYear()}`,
    paginas: revista.totalPaginas,
    conteudo: (revista.paginas ?? []).map((pagina) => ({ ...pagina, texto: paragrafos(pagina.texto) })),
  };
}

export function profissionalDaApi(profissional) {
  return {
    slug: profissional.slug,
    nome: profissional.nome,
    especialidade: profissional.especialidade,
    descricao: profissional.descricao,
    cidade: profissional.cidade,
    atendimento: profissional.atendimento,
    whatsapp: profissional.whatsapp,
    artigos: (profissional.artigos ?? []).map(artigoDaApi),
    colunas: (profissional.colunas ?? []).map(colunaDaApi),
  };
}
