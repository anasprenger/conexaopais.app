// Traduz os erros de conexão com o MySQL em mensagens claras.
// Observação: no Windows, "localhost" aponta para IPv6 e IPv4; quando os dois falham, o Node junta
// as falhas num AggregateError SEM mensagem. Por isso olhamos os códigos de todos os erros internos.

function codigos(erro) {
  return [erro?.code, ...(erro?.errors ?? []).map((interno) => interno.code)].filter(Boolean);
}

function destino() {
  return `${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`;
}

function ehErroDeConexao(erro) {
  return codigos(erro).some((codigo) =>
    ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'].includes(codigo)
  );
}

function mensagemErroMysql(erro) {
  const lista = codigos(erro);
  if (lista.includes('ER_ACCESS_DENIED_ERROR')) {
    return `O MySQL recusou o usuário "${process.env.DB_USER}" ou a senha. Confira DB_USER e DB_PASSWORD no arquivo api/.env.`;
  }
  if (lista.includes('ECONNREFUSED')) {
    return (
      `Não há MySQL respondendo em ${destino()}. Confira se o MySQL está ligado ` +
      '(Windows: abra "Serviços" e inicie o serviço MySQL80; no XAMPP: clique em Start na linha do MySQL) ' +
      'e se DB_HOST e DB_PORT do arquivo api/.env estão certos.'
    );
  }
  if (lista.includes('ENOTFOUND')) return `O endereço DB_HOST do arquivo api/.env não foi encontrado (${destino()}).`;
  if (lista.includes('ETIMEDOUT')) return `O MySQL em ${destino()} não respondeu a tempo.`;
  if (lista.includes('ER_BAD_DB_ERROR')) return 'O banco conexao_pais ainda não existe. Rode: npm run db:setup';
  return erro?.message || lista[0] || String(erro);
}

module.exports = { ehErroDeConexao, mensagemErroMysql };
