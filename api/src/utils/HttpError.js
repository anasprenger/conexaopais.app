// Erro com status HTTP. "campos" leva as mensagens de validação de cada campo do formulário.
class HttpError extends Error {
  constructor(status, message, campos) {
    super(message);
    this.status = status;
    this.campos = campos;
  }
}

module.exports = HttpError;
