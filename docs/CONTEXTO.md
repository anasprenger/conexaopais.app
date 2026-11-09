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

## Situação
- **Entrega 1 ✅ e Entrega 2 ✅** (README seções 1 e 2; dicionário de dados em `docs/banco-de-dados.md`).
- Branch única: `claude/conexao-pais-app-entrega-1-dkbo5f`. Ainda não foi renomeada para `main`.
- **Entrega 3 (próxima):** login devolvendo JWT, token guardado no aparelho (expo-secure-store) e enviado como
  Bearer Token, middleware de autenticação e de nível, rotas protegidas conforme README 2.6, logout. Também tirar o
  `autorId`/`usuarioId` do corpo das requisições (passam a vir do token) e conferir autor/admin no back-end para
  PUT/DELETE de artigos e DELETE de comentários.
- **Entrega 4:** testes, README final, APK. O Android bloqueia HTTP sem criptografia no APK; vai precisar de ajuste (ex.: `usesCleartextTraffic`) ou de API com HTTPS.

## Estrutura
- `database/schema.sql` + `seed.sql`: 10 tabelas, contas de demonstração com senha `123456`
  (`familia@`, `profissional@`, `admin@conexaopais.test`).
- `api/`: Express 5 + mysql2 + bcryptjs, com camadas routes/controllers/models. `npm run db:setup` cria o banco,
  `npm run dev` sobe a API na porta 3333. Configuração em `api/.env` (fora do Git).
- `mobile/`: Expo SDK 58 + React Navigation 7. `src/services/api.js` faz o `fetch` e descobre o IP do computador
  (ou usa `EXPO_PUBLIC_API_URL`). Também tem contextos (Auth, Content, Community, Confirm), o hook `useApi` e o
  `useExigirLogin`.

## Problemas já resolvidos no notebook (Windows)
- `db:setup` falhando com mensagem vazia: o MySQL estava desligado. Agora a mensagem explica a causa.
- QR Code "nenhum dado utilizável": é preciso ler pelo app Expo Go, não pela câmera. Se o IP do Expo não for o do
  Wi-Fi (ex.: 172.x), rodar `set REACT_NATIVE_PACKAGER_HOSTNAME=<IP do Wi-Fi>` antes do `npx expo start`.

## Prévia
Artifact no chat: https://claude.ai/artifact/H6U53SLXydQyiwmpRbHbmn. A página tem uma API simulada dentro dela
(fora do repositório), porque o visualizador não acessa servidores.

## Observações
- Os commits aparecem com autor "Claude". Um tag por entrega foi sugerido, mas não foi feito.
