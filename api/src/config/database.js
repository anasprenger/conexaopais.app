const mysql = require('mysql2/promise');

// Pool de conexões com o MySQL (configurado pelo arquivo .env)
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'conexao_pais',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  // colunas DATE voltam como texto "AAAA-MM-DD" (evita mudar o dia por causa do fuso horário)
  dateStrings: ['DATE'],
});

module.exports = pool;
