require('dotenv').config({ quiet: true });

const os = require('node:os');

const { problemaNoSegredo } = require('./utils/token');

// Sem um JWT_SECRET válido a API não consegue gerar nem conferir tokens: avisa e não sobe
const problema = problemaNoSegredo();
if (problema) {
  console.error(`${problema}\nRode "npm run jwt:segredo" para gerar um segredo e gravar no .env.`);
  process.exit(1);
}

const app = require('./app');

const PORT = Number(process.env.PORT || 3333);

// IPs do computador na rede local (Wi-Fi/cabo): é por eles que o celular acessa a API
function enderecosNaRede() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((rede) => rede && rede.family === 'IPv4' && !rede.internal)
    .map((rede) => rede.address);
}

// 0.0.0.0 permite que o celular (Expo Go ou APK) acesse a API pela rede local
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API do Conexão Pais rodando em http://localhost:${PORT}/api`);
  const ips = enderecosNaRede();
  if (ips.length) {
    console.log('No celular (mesmo Wi-Fi), use em "Conexão com a API":');
    ips.forEach((ip) => console.log(`  http://${ip}:${PORT}/api`));
  }
});
