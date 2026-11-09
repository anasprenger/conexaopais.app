const jwt = require('jsonwebtoken');

// Tokens JWT da API.
// O token é assinado com JWT_SECRET (arquivo .env, fora do Git) e leva só o id (sub) e o nível do usuário.
// Se alguém alterar o conteúdo do token, a assinatura deixa de conferir; sem o segredo, ninguém gera um token válido.

const ALGORITMO = 'HS256';
const TAMANHO_MINIMO_SEGREDO = 32;

function segredo() {
  const valor = process.env.JWT_SECRET;
  if (!valor) throw new Error('JWT_SECRET não está definido no arquivo api/.env.');
  return valor;
}

// Usado ao subir o servidor: explica o problema em vez de falhar só no primeiro login
function problemaNoSegredo() {
  const valor = process.env.JWT_SECRET ?? '';
  if (!valor) return 'JWT_SECRET não está definido no arquivo api/.env.';
  if (valor.length < TAMANHO_MINIMO_SEGREDO) {
    return `JWT_SECRET precisa ter pelo menos ${TAMANHO_MINIMO_SEGREDO} caracteres (hoje tem ${valor.length}).`;
  }
  return null;
}

// Gera o token entregue no login
function gerarToken(usuario) {
  return jwt.sign({ nivel: usuario.nivel }, segredo(), {
    subject: String(usuario.id),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: ALGORITMO,
  });
}

// Confere assinatura e validade. Devolve o conteúdo do token ou lança
// TokenExpiredError (venceu) / JsonWebTokenError (adulterado, malformado ou assinado com outro segredo).
function verificarToken(token) {
  return jwt.verify(token, segredo(), { algorithms: [ALGORITMO] });
}

module.exports = { gerarToken, verificarToken, problemaNoSegredo };
