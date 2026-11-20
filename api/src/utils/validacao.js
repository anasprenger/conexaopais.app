const HttpError = require('./HttpError');

// Lança erro 400 se houver mensagens de validação
function verificarCampos(campos) {
  const erros = Object.fromEntries(Object.entries(campos).filter(([, mensagem]) => mensagem));
  if (Object.keys(erros).length > 0) {
    throw new HttpError(400, 'Confira os campos informados.', erros);
  }
}

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// No banco do site os ids são UUID (ex.: "3f1c2a9e-..."). Um :id da rota fora desse formato vira 404.
function idDaRota(valor, recurso = 'Registro') {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(valor ?? ''))) {
    throw new HttpError(404, `${recurso} não encontrado.`);
  }
  return valor;
}

module.exports = { verificarCampos, texto, emailValido, idDaRota };
