# Contexto do projeto (para continuar em outra conversa)

Projeto avaliativo de Aplicações Mobile da Ana Elisa Sprenger: app **Conexão Pais**, versão mobile do site
conexaopais.com (código do site: repositório `anasprenger/conexaopais`). Orientações: PDF "Projeto Avaliativo –
Aplicação Mobile com JWT", com 4 entregas. O projeto é avaliado pelo repositório.

## Decisões já tomadas
- O app segue o site: artigos, colunas, revista, profissionais e comunidade. O glossário de gírias foi **removido**.
- Identidade do site: logo da árvore, verde `#435733`, ocre `#E1791B`, menta, fontes Fraunces e DM Sans.
- **Banco: o do site (Supabase/PostgreSQL), no lugar do MySQL**, com autorização do professor (16/11/2026), para que
  contas, níveis e publicações sejam os mesmos no site e no app. Branch `integracao-supabase`, que vai virar a
  principal. A versão com MySQL fica no commit `72e0a4f`.
- Arquitetura mantida (exigência do PDF): app → `fetch()` + Bearer Token → **API Express** → banco. A API conecta ao
  Postgres com `pg` (`DATABASE_URL`, Session pooler) e chama o **Supabase Auth** só para conferir senha e criar conta
  (`services/supabaseAuth.js`); **o JWT é gerado pela própria API** (HS256, `JWT_SECRET`, `sub` = UUID da conta).
- Níveis: visitante, `usuario` (família), `profissional` (fica `pendente` até o admin aprovar) e `admin`, vindos de
  `user_roles` (vale o papel mais alto). Verificação em `profiles.verificacao`: pendente, aprovado, recusado.
- **Visitantes leem tudo sem conta.** Curtir, salvar, comentar, perguntar e publicar exigem login. Contato aberto.
- Entidade principal: `publicacoes` do site (tipo `artigo`), com CRUD completo. Artigos identificados pelo **slug**
  (`/artigos/:slug`), como no site; curtidas e comentários ficam ligados ao slug.
- Conteúdos de exemplo do site (artigos, profissionais, colunas, revistas) ficam no código do site (`mock.ts`): a API
  tem uma cópia em `api/src/data/conteudoSite.js` e junta com o banco. Exemplo não é editável; o admin o esconde
  (`conteudos_ocultos`). Remoção de artigo alheio pelo admin grava `remocoes_publicacao`.
- Recursos que o site ganhou depois (commits 50937cf e 16f2c88 do site, 12 e 15/11) já estão no app: página
  "Usuários" do admin (papéis, suspender via `auth.users.banned_until` + `profiles.status`, excluir), excluir a
  própria conta (DELETE em `auth.users`, o banco apaga o resto em cascata; arquivos do Storage ficam, porque o
  Supabase não deixa apagá-los pelo banco), revista com sinopse, modo de leitura (story) e "Editar edição" (título
  e sinopse; o PDF é trocado pelo site).
- Contato e "Pergunte à equipe" vão para `contact_messages` pela função `submit_contact_message` (limite 3/h).
- A senha das contas de teste do site **não** fica no repositório (público). O modo demonstração preenche só o e-mail.

## Situação
- Entregas 1 a 3 ✅; Entrega 4 quase pronta. Integração com o Supabase mesclada na branch principal (PR #2, 20/11).
  48 testes em `api/tests` (`npm test`), com **PGlite** (Postgres em memória) + `database/teste/supabase-simulado.sql`
  + migrations do site + `database/teste/dados-teste.sql`. Os testes não usam o banco real nem o `.env`.
- `api/.env` da Ana já está preenchido no notebook (fora do Git). O app já abriu no iPhone dela pelo Expo Go com a
  API ligada ao banco real (o problema era o Wi-Fi: a casa tem duas redes).
- Ajustes do site de 18/11 (commit 37583ba do site, branch `migracao-supabase`) levados ao app: revista com título do
  campo título e sinopse só embaixo; colunas sem comentários, com curtir e salvar por publicação
  (`POST /colunas/:slug/posts/:postSlug/interacoes`); "Editar" das edições da revista em Minha conta (admin). O
  painel de interações fica só no site; "Começar a leitura" das edições do site abre o PDF dentro do app
  (`components/LeitorPdf.js`: pdf.js do cdnjs numa WebView, o app baixa o PDF e entrega em base64), e não mais no
  navegador. `react-native-webview` é pacote nativo novo: o APK precisa ser gerado de novo depois disso. A migration `20261118230000_painel_interacoes.sql` foi copiada. O código do
  site mais recente está na branch `migracao-supabase` do repositório `anasprenger/conexaopais` (a `main` é antiga).
- **APK gerado** (EAS Build, conta Expo `anasprenger`, 20/11), de novo depois do PR #3 (ajustes do site): link no
  README (seções 4.3 e 9).
- **Falta (com a Ana):** instalar o APK e repetir o
  roteiro do README 4.1 no celular com a API ligada ao banco real; conferir se o projeto exige confirmação de e-mail
  no cadastro; marcar a Entrega 4 como concluída. Os arquivos de build da Expo podem expirar: guardar o `.apk` também
  num Release do GitHub.
- Branch padrão do GitHub continua `claude/conexao-pais-app-entrega-1-dkbo5f` (renomear para `main` é opcional).

## Estrutura
- `database/supabase/migrations/`: cópia das migrations do site (estrutura oficial do banco).
- `api/`: Express 5 + pg + jsonwebtoken. `npm run jwt:segredo`, `npm run db:conferir`, `npm run dev`, `npm test`.
- `mobile/`: Expo SDK 58 + React Navigation 7. `src/services/api.js` faz o `fetch` com Bearer Token. No app, o "id"
  de um artigo é o slug (`formatadores.js`). Pacotes Expo novos: `npx expo install` (na nuvem, `EXPO_OFFLINE=1`).

## Observações
- A API conecta como dona do banco: o RLS do Supabase não vale para ela; os middlewares aplicam as regras. Gatilhos
  que usam `auth.uid()` recebem o id de quem age via `comoUsuario` (`config/database.js`).
- Se o site mudar o `mock.ts`, atualizar `api/src/data/conteudoSite.js`. Se o site criar migrations novas, copiar
  para `database/supabase/migrations/`.
- Os commits aparecem com autor "Claude".
