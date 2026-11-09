require('dotenv').config({ quiet: true });

const { problemaNoSegredo } = require('./utils/token');

// Sem um JWT_SECRET válido a API não consegue gerar nem conferir tokens: avisa e não sobe
const problema = problemaNoSegredo();
if (problema) {
  console.error(`${problema}\nRode "npm run jwt:segredo" para gerar um segredo e gravar no .env.`);
  process.exit(1);
}

const app = require('./app');

const PORT = Number(process.env.PORT || 3333);

// 0.0.0.0 permite que o celular (Expo Go) acesse a API pela rede local
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API do Conexão Pais rodando em http://localhost:${PORT}/api`);
});
