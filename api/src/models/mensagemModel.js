const { query } = require('../config/database');

// Mensagens de Contato e "Pergunte à equipe": vão para a tabela public.contact_messages do site,
// onde a administração já lê as mensagens enviadas pelo formulário do site.
// O envio usa a função submit_contact_message do banco, a mesma do site: ela valida os campos e
// limita a 3 mensagens por hora para o mesmo e-mail (proteção contra spam).
async function criar({ nome, email, assunto, mensagem }) {
  const [{ id }] = await query('SELECT public.submit_contact_message($1, $2, $3, $4) AS id', [
    nome,
    email,
    assunto || '',
    mensagem,
  ]);
  const [linha] = await query(
    'SELECT id, name AS nome, email, subject AS assunto, message AS mensagem, status, created_at AS "criadoEm" FROM public.contact_messages WHERE id = $1',
    [id]
  );
  return linha;
}

module.exports = { criar };
