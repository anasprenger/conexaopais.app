# Contexto do projeto (para continuar em outra conversa)

Projeto avaliativo de Aplicações Mobile da Ana Elisa Sprenger: app **Conexão Pais**, versão mobile do site
conexaopais.com.br (código do site: repositório `anasprenger/conexaopais`, feito no Lovable/Supabase).
Orientações: PDF "Projeto Avaliativo – Aplicação Mobile com JWT", com 4 entregas. O projeto é avaliado pelo repositório.

## Decisões já tomadas
- O app segue o site: artigos, colunas, revista, profissionais e comunidade. O glossário de gírias (ideia antiga do DOCX) foi **removido**.
- Identidade do site: logo da árvore, verde `#435733`, ocre `#E1791B`, menta, fontes Fraunces e DM Sans.
- Banco **MySQL** (exigido pelo PDF). Firebase foi descartado por fugir dos critérios.
- Níveis: visitante, `usuario` (família), `profissional` (fica `pendente` até o admin aprovar) e `admin`.
- **Visitantes leem tudo sem conta.** Curtir, salvar, comentar, perguntar e publicar exigem login. Contato fica aberto a todos.
- Entidade principal: `publicacoes` (artigos), com CRUD completo.
- Cadastro e login com bcrypt já foram feitos na Entrega 2, porque o banco precisa de autor real.
- JWT (Entrega 3): token HS256 com `sub` (id) e `nivel`, validade `JWT_EXPIRES_IN` (7d). O middleware `autenticar`
  relê a conta no banco a cada requisição, então aprovação/recusa do admin vale sem novo login. Logout é no app
  (apaga o token; JWT é stateless). Identidade sempre do token: `autorId`/`usuarioId` do corpo são ignorados.

## Situação
- **Entregas 1, 2 e 3 ✅; Entrega 4 quase pronta** (README seções 1 a 4; roteiro em `docs/apresentacao.md`).
- Branch principal (padrão do repositório): `claude/conexao-pais-app-entrega-1-dkbo5f`, ainda não renomeada para
  `main`. As Entregas 3 e 4 foram feitas na branch `claude/clever-galileo-2xtsnf` e entram na principal pelo PR #1
  (a Ana optou por merge depois; até lá a principal está na Entrega 2).
- **Entrega 3 (feita):** login devolve JWT; token guardado com expo-secure-store (localStorage no Expo Web) e enviado
  como Bearer Token por `services/api.js`; middlewares `autenticacao.js` e `permissoes.js`; rotas protegidas
  conforme README 3.6; `GET /auth/perfil`; logout com confirmação; sessão restaurada ao abrir o app; token recusado
  (401) encerra a sessão com aviso "Sua sessão expirou". 28 testes automatizados em `api/tests` (`npm test`).
- **Entrega 4 (feita aqui):** `mobile/eas.json` (perfil `preview` = APK), `expo-build-properties` com
  `usesCleartextTraffic` (API no notebook por HTTP; conferido no AndroidManifest do prebuild), tela
  **Conexão com a API** (`ApiConfigScreen`, guarda o endereço com `services/configuracao.js`), API imprime os IPs da
  rede ao subir, roteiro de testes por nível no README 4.1, roteiro da apresentação.
- **Falta (com a Ana):** gerar o APK no notebook (`npm install -g eas-cli`, `eas login`, `cd mobile`,
  `npm run build:apk`), testar no celular, colocar o link do APK no README (seção 9) e fazer o merge do PR #1.
  Decisões: API fica no notebook (não hospedada); APK pelo EAS Build.
- **Pendente:** o app ainda não abriu no celular da Ana pelo Expo Go ("não é possível carregar"); ela vai mandar o
  print do erro. Suspeitas: IP errado do Expo (172.x), Expo Go desatualizado para o SDK 58 ou `npm install` não rodado
  depois de trocar de branch.

## Estrutura
- `database/schema.sql` + `seed.sql`: 10 tabelas, contas de demonstração com senha `123456`
  (`familia@`, `profissional@`, `admin@conexaopais.test`).
- `api/`: Express 5 + mysql2 + bcryptjs + jsonwebtoken, com camadas routes/middlewares/controllers/models.
  `npm run jwt:segredo` grava o JWT_SECRET no `.env`, `npm run db:setup` cria o banco, `npm run dev` sobe a API na
  porta 3333 (não sobe sem JWT_SECRET de 32+ caracteres), `npm test` roda os testes. Configuração em `api/.env`
  (fora do Git).
- `mobile/`: Expo SDK 58 + React Navigation 7. `src/services/api.js` faz o `fetch`, manda o Bearer Token e descobre
  o IP do computador (ou usa `EXPO_PUBLIC_API_URL`); `src/services/sessao.js` guarda a sessão. Também tem contextos
  (Auth, Content, Community, Confirm), o hook `useApi` e o `useExigirLogin`. Pacotes Expo novos: instalar com
  `npx expo install` (no ambiente da nuvem, `EXPO_OFFLINE=1`, porque a API da Expo é bloqueada).

## Problemas já resolvidos no notebook (Windows)
- Depois de atualizar para a Entrega 3: `npm install` em `api/` e `mobile/` e `npm run jwt:segredo` uma vez.
- `npm run jwt:segredo` dando "Missing script": o notebook estava na branch principal (Entrega 2); a Entrega 3 está
  na branch do PR até o merge (`git checkout claude/clever-galileo-2xtsnf`).
- `db:setup` falhando com mensagem vazia: o MySQL estava desligado. Agora a mensagem explica a causa.
- QR Code "nenhum dado utilizável": é preciso ler pelo app Expo Go, não pela câmera. Se o IP do Expo não for o do
  Wi-Fi (ex.: 172.x), rodar `set REACT_NATIVE_PACKAGER_HOSTNAME=<IP do Wi-Fi>` antes do `npx expo start`.

## Prévia
Artifact no chat: https://claude.ai/artifact/H6U53SLXydQyiwmpRbHbmn (versão da Entrega 2, não atualizada na
Entrega 3). A página tem uma API simulada dentro dela (fora do repositório), porque o visualizador não acessa
servidores.

## Observações
- Os commits aparecem com autor "Claude". Um tag por entrega foi sugerido, mas não foi feito.
