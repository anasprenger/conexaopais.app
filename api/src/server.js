require('dotenv').config({ quiet: true });

const app = require('./app');

const PORT = Number(process.env.PORT || 3333);

// 0.0.0.0 permite que o celular (Expo Go) acesse a API pela rede local
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API do Conexão Pais rodando em http://localhost:${PORT}/api`);
});
