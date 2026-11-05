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

// Converte o parâmetro :id da rota em número (ou 404 se não for um id válido)
function idDaRota(valor, recurso = 'Registro') {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, `${recurso} não encontrado.`);
  return id;
}

module.exports = { verificarCampos, texto, emailValido, idDaRota };
