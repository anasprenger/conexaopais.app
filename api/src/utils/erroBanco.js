// Traduz os erros do PostgreSQL (banco do Supabase) em mensagens claras.

function codigos(erro) {
  // No Windows, uma falha de conexão pode vir como AggregateError sem mensagem: olha os erros internos também
  return [erro?.code, ...(erro?.errors ?? []).map((interno) => interno.code)].filter(Boolean);
}

const FALHAS_DE_CONEXAO = [
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNRESET',
  'EAI_AGAIN',
  'ENETUNREACH',
  '28P01', // senha do banco errada
  '28000', // usuário sem permissão de acesso
  '3D000', // banco não existe
  'XX000', // pooler do Supabase recusou (ex.: "Tenant or user not found")
];

function ehErroDeConexao(erro) {
  return codigos(erro).some((codigo) => FALHAS_DE_CONEXAO.includes(codigo)) || /DATABASE_URL|connection string/i.test(erro?.message ?? '');
}

function mensagemErroBanco(erro) {
  const lista = codigos(erro);
  if (!process.env.DATABASE_URL) return 'DATABASE_URL não está definido no arquivo api/.env.';
  if (lista.includes('28P01')) return 'O banco recusou a senha. Confira a senha dentro de DATABASE_URL no arquivo api/.env.';
  if (lista.includes('XX000')) return `O Supabase recusou a conexão (${erro.message}). Confira o usuário (postgres.<id do projeto>) em DATABASE_URL.`;
  if (lista.includes('ENOTFOUND') || lista.includes('EAI_AGAIN')) {
    return 'O endereço do banco em DATABASE_URL não foi encontrado. Confira a internet e copie de novo o "Session pooler" no painel do Supabase.';
  }
  if (lista.includes('ENETUNREACH')) {
    return 'A rede não alcançou o banco. Use o endereço do "Session pooler" (IPv4) do Supabase em DATABASE_URL, e não o "Direct connection".';
  }
  if (lista.includes('ECONNREFUSED') || lista.includes('ETIMEDOUT')) return 'O banco não respondeu. Confira a internet e o endereço em DATABASE_URL.';
  return erro?.message || lista[0] || String(erro);
}

module.exports = { ehErroDeConexao, mensagemErroBanco };
