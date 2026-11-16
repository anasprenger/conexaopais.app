const HttpError = require('../utils/HttpError');

// Contas de usuário: as mesmas do site.
// Quem guarda e-mail e senha é o Supabase Auth, o serviço de contas do Supabase usado pelo site.
// A senha nunca é guardada em texto: o Supabase salva só o hash bcrypt (coluna encrypted_password da
// tabela auth.users). Esta API pede ao Supabase Auth para conferir a senha no login e para criar a conta
// no cadastro. Depois do login, quem gera e confere o token JWT do app é a própria API (utils/token.js).

function configuracao() {
  const url = (process.env.SUPABASE_URL ?? '').replace(/\/+$/, '');
  const chave = process.env.SUPABASE_PUBLISHABLE_KEY ?? '';
  if (!url || !chave) {
    throw new Error('Defina SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no arquivo api/.env.');
  }
  return { url, chave };
}

async function chamar(caminho, corpo) {
  const { url, chave } = configuracao();
  let resposta;
  try {
    resposta = await fetch(`${url}/auth/v1${caminho}`, {
      method: 'POST',
      headers: { apikey: chave, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
  } catch {
    throw new HttpError(503, 'Não foi possível falar com o serviço de contas do Supabase. Confira a internet do computador da API.');
  }
  const dados = await resposta.json().catch(() => ({}));
  return { ok: resposta.ok, status: resposta.status, dados, codigo: dados.error_code ?? dados.code ?? dados.error };
}

// Confere e-mail e senha. Devolve o id da conta (o mesmo id usado em todas as tabelas do site).
async function entrar(email, senha) {
  const { ok, status, dados, codigo } = await chamar('/token?grant_type=password', { email, password: senha });
  if (ok && dados.user?.id) return { id: dados.user.id };

  if (codigo === 'email_not_confirmed') {
    throw new HttpError(401, 'Confirme seu e-mail antes de entrar. Procure a mensagem do Conexão Pais na sua caixa de entrada.');
  }
  if (codigo === 'user_banned') {
    throw new HttpError(403, 'Esta conta está suspensa. Se achar que é um engano, fale com a administração pela página Contato.');
  }
  if (status === 429) throw new HttpError(429, 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.');
  if (status >= 500) throw new HttpError(503, 'O serviço de contas do Supabase não respondeu. Tente de novo em instantes.');
  throw new HttpError(401, 'E-mail ou senha incorretos.');
}

// Cria a conta. Os dados extras (nome, tipo de conta, profissão) vão como "metadados": um gatilho do banco
// do site (handle_new_user) usa esses dados para criar o perfil e o nível da pessoa, igual ao cadastro do site.
// Se o projeto exigir confirmação de e-mail, o Supabase envia a mensagem e a conta só entra depois de confirmar.
async function cadastrar({ email, senha, nome, tipo, profissao, registro }) {
  const site = (process.env.SITE_URL || 'https://conexaopais.com').replace(/\/+$/, '');
  const { ok, status, dados, codigo } = await chamar(`/signup?redirect_to=${encodeURIComponent(`${site}/minha-conta`)}`, {
    email,
    password: senha,
    data: {
      display_name: nome,
      tipo_conta: tipo,
      ...(tipo === 'profissional' && { profissao, registro_profissional: registro }),
    },
  });

  if (ok) {
    const usuario = dados.user ?? dados;
    return { id: usuario.id, confirmarEmail: !dados.access_token };
  }
  if (codigo === 'user_already_exists' || codigo === 'email_exists') {
    throw new HttpError(409, 'Este e-mail já está cadastrado.', { email: 'Este e-mail já está cadastrado.' });
  }
  if (codigo === 'weak_password') {
    throw new HttpError(400, 'Escolha uma senha mais forte.', { senha: dados.msg || 'Escolha uma senha mais forte.' });
  }
  if (codigo === 'email_address_invalid' || codigo === 'validation_failed') {
    throw new HttpError(400, 'Confira os campos informados.', { email: 'Informe um e-mail válido.' });
  }
  if (status === 429) throw new HttpError(429, 'Muitos cadastros seguidos. Aguarde alguns minutos e tente de novo.');
  throw new HttpError(503, 'O serviço de contas do Supabase não conseguiu criar a conta agora. Tente de novo em instantes.');
}

module.exports = { entrar, cadastrar };
