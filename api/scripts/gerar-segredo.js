// Gera um JWT_SECRET aleatório e grava no api/.env (se ainda não houver um).
// Uso: npm run jwt:segredo
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const arquivoEnv = path.join(__dirname, '..', '.env');
const segredo = crypto.randomBytes(48).toString('hex'); // 96 caracteres

if (!fs.existsSync(arquivoEnv)) {
  console.error('Arquivo api/.env não encontrado. Copie o .env.example para .env e rode este comando de novo.');
  process.exit(1);
}

const conteudo = fs.readFileSync(arquivoEnv, 'utf8');
const linhaAtual = conteudo.match(/^JWT_SECRET=(.*)$/m);

if (linhaAtual && linhaAtual[1].trim().length >= 32) {
  console.log('O api/.env já tem um JWT_SECRET. Nada foi alterado.');
  process.exit(0);
}

const novoConteudo = linhaAtual
  ? conteudo.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${segredo}`)
  : `${conteudo.replace(/\s*$/, '')}\nJWT_SECRET=${segredo}\n`;

fs.writeFileSync(arquivoEnv, novoConteudo);
console.log('✔ JWT_SECRET gerado e gravado no api/.env (não envie esse arquivo para o Git).');
