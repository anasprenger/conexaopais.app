// Cria o banco e carrega os dados iniciais: executa database/schema.sql e database/seed.sql.
// Uso: npm run db:setup (lê a conexão do arquivo .env). ATENÇÃO: recria as tabelas.
require('dotenv').config({ quiet: true });

const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

async function main() {
  const conexao = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
    multipleStatements: true,
  });

  for (const arquivo of ['schema.sql', 'seed.sql']) {
    const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', arquivo), 'utf8');
    await conexao.query(sql);
    console.log(`✔ ${arquivo} executado`);
  }

  const [[{ total }]] = await conexao.query('SELECT COUNT(*) AS total FROM conexao_pais.publicacoes');
  console.log(`Banco conexao_pais pronto (${total} artigos).`);
  await conexao.end();
}

main().catch((erro) => {
  console.error('Não foi possível preparar o banco:', erro.message);
  process.exit(1);
});
